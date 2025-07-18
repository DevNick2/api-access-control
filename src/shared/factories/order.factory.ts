import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderFactory {
  constructor() {}

  // ?order=created_date:asc

  addOrderToQuery(query?: string) {
    const orders = this.orderToObject(query);

    let order = {};

    if (orders?.length) {
      for (const orderItem of orders) {
        for (const orderKey in orderItem) {
          order = {
            [orderKey]: orderItem[orderKey],
          };
        }
      }
    }

    return order;
  }

  private orderToObject(query?: string): Array<object> {
    if (!query) return;

    const orderObject = [];

    const sParams = query.split(';');

    for (const sParam of sParams) {
      // sValues: [
      //   'created_date'
      //   'asc',
      // ]
      // sValues: [
      //   'updated_date'
      //   'desc',
      // ]
      const sValues = sParam.split(':');
      const sKey = sValues.shift();

      // orderObject: [
      //   {
      //     created_date: 'asc'
      //   },
      //   {
      //     updated_date: 'asc'
      //   }
      // ]
      orderObject.push({
        [sKey]: sValues.pop(),
      });
    }

    return orderObject;
  }
}
