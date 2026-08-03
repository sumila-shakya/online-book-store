import cron from 'node-cron'
import { ordersServices } from '../services/orders.service'

export const failedOrdersCron = () => {
    cron.schedule('0 3 * * *', async ()=> {
        await ordersServices.updateFailedOrders()
    })
}
