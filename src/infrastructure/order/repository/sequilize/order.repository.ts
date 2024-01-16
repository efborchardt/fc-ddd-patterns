import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(order: Order): Promise<void> {
    const orderData = this.mapOrderToData(order);
    await OrderModel.create(orderData, { include: [{ model: OrderItemModel }] });
  }

  async update(order: Order): Promise<void> {
    await this.updateOrderDetails(order);
    await this.updateOrCreateOrderItems(order);
  }

  async find(id: string): Promise<Order> {
    const order = await OrderModel.findByPk(id, { include: [{ model: OrderItemModel }] });
  
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
  
    return this.mapDataToOrder(order);
  }

  async findAll(): Promise<Order[]> {
    const ordersData = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });

    if (ordersData.length === 0) {
      throw new Error('No Order found');
    }

    return ordersData.map((order) => this.mapDataToOrder(order));
  }

  private async updateOrderDetails(order: Order): Promise<void> {
    await OrderModel.update(
      { customer_id: order.customerId, total: order.total() },
      { where: { id: order.id } }
    );
  }

  private async updateOrCreateOrderItems(order: Order): Promise<void> {
    for (const item of order.items) {
      if (item.id) {
        const existingItem = await OrderItemModel.findByPk(item.id);
        if (existingItem) {
          await this.updateOrderItem(item);
        } else {
          await this.createOrderItem(item, order.id);
        }
      }
    }
  }

  private async updateOrderItem(item: OrderItem): Promise<void> {
    await OrderItemModel.update(
      {
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      },
      { where: { id: item.id } }
    );
  }

  private async createOrderItem(item: OrderItem, orderId: string): Promise<void> {
    await OrderItemModel.create({
      id: item.id,
      name: item.name,
      price: item.price,
      product_id: item.productId,
      quantity: item.quantity,
      order_id: orderId,
    });
  }

  private mapOrderToData(order: Order): any {
    return {
      id: order.id,
      customer_id: order.customerId,
      total: order.total(),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
      })),
    }
  }

  private mapDataToOrder(data: any): Order {
    const orderItemsData = data.items || [];
    const orderItems = orderItemsData.map(
      (item: any) => new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
    );
  
    return new Order(data.id, data.customer_id, orderItems);
  }
}