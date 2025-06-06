import axiosClient from "./axiosClient"

const statisticApi = {
    getTotalRevenue: () => {
        const url = `statistics/revenue/all`
        return axiosClient.get(url)
    },
    getRevenueWeek: ({start, end}) => {
        const url = `statistics/revenue/week`
        return axiosClient.get(url, { params: {start, end}})
    },
    getRevenueLifeTime: () => {
        const url = `statistics/revenue/lifetime`
        return axiosClient.get(url)
    },
    getOrderCountLifeTime: () => {
        const url = `statistics/ordercount/lifetime`
        return axiosClient.get(url)
    },
    getBestSeller: () => {
        const url = `statistics/product/bestseller`
        return axiosClient.get(url)
    },
}

export default statisticApi