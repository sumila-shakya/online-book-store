import cron from 'node-cron'
import { ordersServices } from '../services/orders.service'

export const failedOrdersCron = () => {
    // run every day at 3 am cause ther is less traffic
    cron.schedule('0 3 * * *', async ()=> {
        await ordersServices.updateFailedOrders()
    })
}
