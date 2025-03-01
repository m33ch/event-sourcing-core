# Event Sourcing Core

A generic Event Sourcing and Domain Event management library for Node.js (TypeScript).
This library provides the core infrastructure for implementing Event Sourcing, Aggregate management, and sagas in a clean, modular, and scalable way.
It does not include command or query layers, focusing solely on the event sourcing core.

> **Note:** Requires Node.js **\>=16**.

## Features

- **Event Sourcing Core:** Infrastructure to record, store, and replay immutable domain events.
- **Aggregate Root:** Base class for aggregates with version management, uncommitted event tracking, and rehydration support.
- **Domain Events:** A base class (`BaseDomainEvent`) to create domain events with built-in support for correlation, causation tracking, and multi-tenancy.
- **Domain Event Context:** Utilizes AsyncLocalStorage to manage correlation IDs and a stack of causation IDs for tracing event flows.
- **Sagas:** Support for implementing sagas (process managers) to orchestrate long-running business processes.
- **In-Memory Implementations:** Provides in-memory implementations for testing/demo.

## Installation

Install via npm:

```bash
npm install event-sourcing-core
```

Or with yarn:

```bash
yarn add event-sourcing-core
```

## Requirements

- Node.js >= 16
- TypeScript

## Getting Started

### Creating an Aggregate

Extend the `AggregateRoot` to implement your domain aggregates. For example, a simple Customer aggregate:

```typescript
import { AggregateRoot, DomainEvent } from 'event-sourcing-core';

interface CustomerState {
  customerId: string;
  companyName: string;
  email: string;
}

export class CustomerAggregate extends AggregateRoot {
  private customerId: string;
  private companyName: string;
  private email: string;

  protected constructor(customerId: string, companyName: string, email: string) {
    super();
    if (!customerId || !companyName) {
      throw new Error('CustomerId and CompanyName are mandatory');
    }
    this.customerId = customerId;
    this.companyName = companyName;
    this.email = email;
  }

  public static create(customerId: string, companyName: string, email: string): CustomerAggregate {
    const customer = new CustomerAggregate(customerId, companyName, email);
    customer.recordEvent({
      eventId: '', // Will be generated automatically if using BaseDomainEvent
      eventType: 'CustomerCreatedEvent',
      aggregateType: 'Customer',
      aggregateId: customerId,
      version: 0,
      occurredOn: new Date(),
      recordedOn: new Date(),
      payload: { companyName, email }
    });
    return customer;
  }

  protected applyEvent(event: DomainEvent): void {
    if (event.eventType === 'CustomerCreatedEvent') {
      this.companyName = event.payload.companyName as string;
      this.email = event.payload.email as string;
      this.customerId = event.aggregateId;
    }
  }

  public toState(): CustomerState {
    return { customerId: this.customerId, companyName: this.companyName, email: this.email };
  }

  public static fromState(state: CustomerState): CustomerAggregate {
    // Use createEmpty to bypass constructor validations during rehydration
    const customer = CustomerAggregate.createEmpty();
    customer.customerId = state.customerId;
    customer.companyName = state.companyName;
    customer.email = state.email;
    return customer;
  }
}
```

### Domain Event Context

The library includes a `DomainEventContext` that uses AsyncLocalStorage to manage correlation and causation IDs. This allows you to automatically attach these IDs to every event without "polluting" your domain methods.

```typescript
import { DomainEventContext } from 'event-sourcing-core';

await DomainEventContext.run({ correlationId: 'abc-123', causationStack: [] }, async () => {
  // All events recorded here will automatically receive the correlationId 'abc-123'
});
```

### Sagas

You can implement sagas to orchestrate long-running processes. For example, a saga that listens for a `ContactCreatedEvent` and triggers a command to add that contact to a customer:

```typescript
import { Injectable } from '@nestjs/common';
import { Saga, ofType } from '@nestjs/cqrs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContactCreatedEvent } from './domain/events/contact-created.event';
import { AddContactToCustomerCommand } from './application/commands/add-contact-to-customer.command';

@Injectable()
export class CustomerSaga {
  @Saga()
  customerContactSaga = (events$: Observable<any>): Observable<any> => {
    return events$.pipe(
      ofType(ContactCreatedEvent),
      map((event: ContactCreatedEvent) => {
        return new AddContactToCustomerCommand(
          event.payload.customerId,
          event.aggregateId, // contactId
          event.payload.fullName,
          event.payload.email,
          event.payload.phoneNumber,
          event.payload.role,
          event.correlationId,
          event.eventId // using eventId as causationId
        );
      })
    );
  };
}
```

### API Reference

- **DomainEvent**: Interface defining the structure of a domain event.
- **BaseDomainEvent**: Base class for domain events. Extend it for custom events (e.g., CustomerCreatedEvent).
- **AggregateRoot**: Abstract class for aggregates. Provides methods for recording and applying events, version management, and rehydration.
- **EventSourcedRepository**: Loads and saves aggregates using an event store and snapshot store.
- **InMemoryEventStore** / **InMemorySnapshotStore**: In-memory implementations for testing or lightweight scenarios.
- **DomainEventContext**: Utility to manage correlation and causation IDs using AsyncLocalStorage.
- **Sagas**: Support for implementing sagas to orchestrate complex processes.

### Contributing

Contributions, bug reports, and pull requests are welcome!
Please see CONTRIBUTING for details.

### License

This project is licensed under the MIT License. See LICENSE for details.
