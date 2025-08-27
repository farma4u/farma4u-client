'use client'

import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/DashboardLayout'
import { sendRequest } from '@/lib/sendRequest'
import { useToast } from '@/components/ui/use-toast'
import { DetailsRow } from '@/components/DetailsRow'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface OrdersData {
  totalSavings: number
  totalOrderCount: number
}

interface ClientsCountData {
  activeCount: number
  inactiveCount: number
  defaultingCount: number
  deletedCount: number
}

interface RevenueData {
  revenue: number
  defaulting: number
}

export default function MembersPage() {
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null)
  const [clientsCountData, setClientsCountData] = useState<ClientsCountData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)

  const { toast } = useToast()

  // --------------------------- ORDERS DATA FETCHING ---------------------------
  async function fetchOrdersData () {
    const response = await sendRequest<{ systemData: OrdersData }>({
      endpoint: '/user/meta',
      method: 'GET',
    })

    if (response.error) {
      toast({
        description: response.message,
        variant: 'destructive'
      })

      return
    }

    setOrdersData(response.data.systemData)
  }

  // --------------------------- CLIENTS COUNT DATA FETCHING ---------------------------
  async function fetchClientsCountData () {
    const response = await sendRequest<{ clientsCount: ClientsCountData }>({
      endpoint: '/admin/client/count',
      method: 'GET',
    })

    if (response.error) {
      toast({
        description: response.message,
        variant: 'destructive'
      })

      return
    }

    setClientsCountData(response.data.clientsCount)
  }

  // --------------------------- REVENUE DATA FETCHING ---------------------------
  async function fetchRevenueData () {
    const response = await sendRequest<{ revenueAndDelinquencyData: RevenueData }>({
      endpoint: '/admin/revenue',
      method: 'GET',
    })

    if (response.error) {
      toast({
        description: response.message,
        variant: 'destructive'
      })

      return
    }

    setRevenueData(response.data.revenueAndDelinquencyData)
  }

  // --------------------------- USE EFFECTS ---------------------------
  useEffect(() => {
    fetchOrdersData()
    fetchClientsCountData()
    fetchRevenueData()
  }, [])

  // --------------------------- RETURN ---------------------------
  return (
    <DashboardLayout
      title="Financeiro"
      secondaryText={`Total de pedidos: ${ordersData?.totalOrderCount} / Economia total: ${formatCurrency(ordersData?.totalSavings ?? 0)}`}
    >
      {/* Contagem de clientes */}
      <Label className='text-lg font-semibold'>Contagem de clientes</Label>
      <DetailsRow>
        <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1 text-green-600'>
          <Label className='text-md font-medium'>Ativos</Label>
          <div className='text-3xl font-bold text-right'>{clientsCountData?.activeCount ?? 0}</div>
        </div>
        <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1 text-rose-600'>
          <Label className='text-md font-medium'>Inadimplentes</Label>
          <div className='text-3xl font-bold text-right'>{clientsCountData?.defaultingCount ?? 0}</div>
        </div>
        <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1'>
          <Label className='text-md font-medium'>Inativos</Label>
          <div className='text-3xl font-bold text-right'>{clientsCountData?.inactiveCount ?? 0}</div>
        </div>
        <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1'>
          <Label className='text-md font-medium'>Excluídos</Label>
          <div className='text-3xl font-bold text-right'>{clientsCountData?.deletedCount ?? 0}</div>
        </div>
      </DetailsRow>

      <Separator />

      {/* Faturamento e inadimplência */}
      <Label className='text-lg font-semibold'>Faturamento e inadimplência</Label>
      <DetailsRow>
        <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1 text-green-600'>
          <Label className='text-md font-medium'>Faturamento</Label>
          <div className='text-3xl font-bold text-right'>{formatCurrency(revenueData?.revenue ?? 0)}</div>
        </div>
        <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1 text-rose-600'>
          <Label className='text-md font-medium'>Inadimplência</Label>
          <div className='text-3xl font-bold text-right'>{formatCurrency(revenueData?.defaulting ?? 0)}</div>
        </div>
      </DetailsRow>
    </DashboardLayout>
  )
}
