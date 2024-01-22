import CustomerAdressChangedEvent from "../../customer/event/customer-adress-changed.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import SendConsoleLogWhenAdressChangedHandler from "../../customer/event/handler/send-console-log-when-adress-changed.handler";
import SendConsoleLog1Handler from "../../customer/event/handler/send-console-log1.handler";
import SendConsoleLog2Handler from "../../customer/event/handler/send-console-log2.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const sendEmailWhenProductIsCreatedHandler = new SendEmailWhenProductIsCreatedHandler();
    const sendConsoleLogWhenAdressChangedHandler = new SendConsoleLogWhenAdressChangedHandler()
    const sendConsoleLog1Handler = new SendConsoleLog1Handler();
    const sendConsoleLog2Handler = new SendConsoleLog2Handler();

    const spysendEmailWhenProductIsCreatedHandler = jest.spyOn(sendEmailWhenProductIsCreatedHandler, "handle");
    const spySendConsoleLogWhenAdressChangedHandler = jest.spyOn(sendConsoleLogWhenAdressChangedHandler, "handle");
    const spySendConsoleLog1Handler = jest.spyOn(sendConsoleLog1Handler, "handle");
    const spySendConsoleLog2Handler = jest.spyOn(sendConsoleLog2Handler, "handle");

    eventDispatcher.register("ProductCreatedEvent", sendEmailWhenProductIsCreatedHandler);
    eventDispatcher.register("CustomerCreatedEvent", sendConsoleLog1Handler);
    eventDispatcher.register("CustomerCreatedEvent", sendConsoleLog2Handler);
    eventDispatcher.register("CustomerAdressChangedEvent", sendConsoleLogWhenAdressChangedHandler);
    
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(sendEmailWhenProductIsCreatedHandler);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(sendConsoleLog1Handler);
    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]
    ).toMatchObject(sendConsoleLog2Handler);
    expect(
      eventDispatcher.getEventHandlers["CustomerAdressChangedEvent"][0]
    ).toMatchObject(sendConsoleLogWhenAdressChangedHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });
    eventDispatcher.notify(productCreatedEvent);

    const customerCreatedEvent = new CustomerCreatedEvent({});
    eventDispatcher.notify(customerCreatedEvent);

    const adress = new Address("Street 1", 123, "13330-250", "São Paulo");
    const customerAdressChangedEvent = new CustomerAdressChangedEvent({
      id: "123",
      name: "Customer 1",
      adress,
    });
    eventDispatcher.notify(customerAdressChangedEvent);

    expect(spysendEmailWhenProductIsCreatedHandler).toHaveBeenCalled();
    expect(spySendConsoleLog1Handler).toHaveBeenCalled();
    expect(spySendConsoleLog2Handler).toHaveBeenCalled();
    expect(spySendConsoleLogWhenAdressChangedHandler).toHaveBeenCalled();
  });
});
