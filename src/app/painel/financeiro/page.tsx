'use client'

import { useEffect, useState } from 'react'

import { applyCnpjMask, formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/DashboardLayout'
import { sendRequest } from '@/lib/sendRequest'
import { useToast } from '@/components/ui/use-toast'
import { DetailsRow } from '@/components/DetailsRow'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

interface BillingItem {
  amount: number
  client: {
    cnpj: string
    fantasyName: string
    id: string
  }
  dueDay: number | null
  id: string
  month: number
  paidAt: string | null
  status: 'pending' | 'paid' | 'defaulting'
  year: number
}

interface BillingSummary {
  defaultingAmount: number
  defaultingCount: number
  paidAmount: number
  paidCount: number
  pendingAmount: number
  pendingCount: number
  totalAmount: number
  totalCount: number
}

interface BillingData {
  billings: BillingItem[]
  summary: BillingSummary
}

const BILLING_STATUS_TRANSLATION = {
  defaulting: 'Inadimplente',
  paid: 'Pago',
  pending: 'Pendente'
}

const formatBillingCount = (count: number): string => `${count} ${count === 1 ? 'cobrança' : 'cobranças'}`

const formatDueDate = (day: number | null, month: number, year: number): string => {
  if (!day) return '-'

  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`
}

export default function MembersPage() {
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null)
  const [clientsCountData, setClientsCountData] = useState<ClientsCountData | null>(null)
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

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

  async function fetchBillingData () {
    const response = await sendRequest<{ billingData: BillingData }>({
      endpoint: `/admin/billing?month=${month}&year=${year}`,
      method: 'GET',
    })

    if (response.error) {
      toast({
        description: response.message,
        variant: 'destructive'
      })

      return
    }

    setBillingData(response.data.billingData)
  }

  async function updateBillingStatus (id: string, status: BillingItem['status']) {
    const response = await sendRequest({
      endpoint: `/admin/billing/${id}/status`,
      method: 'PATCH',
      data: { status }
    })

    if (response.error) {
      toast({
        description: response.message,
        variant: 'destructive'
      })

      return
    }

    toast({
      description: response.message,
      variant: 'success'
    })

    fetchBillingData()
  }

  // --------------------------- USE EFFECTS ---------------------------
  useEffect(() => {
    fetchOrdersData()
    fetchClientsCountData()
  }, [])

  useEffect(() => {
    fetchBillingData()
  }, [month, year])

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

      <div className='flex flex-col gap-4'>
        <div className='flex items-end gap-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor="month">Mês</Label>
            <Input
              className='bg-white w-28'
              id="month"
              max={12}
              min={1}
              onChange={(event) => setMonth(parseInt(event.target.value))}
              type="number"
              value={month}
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label htmlFor="year">Ano</Label>
            <Input
              className='bg-white w-32'
              id="year"
              min={2000}
              onChange={(event) => setYear(parseInt(event.target.value))}
              type="number"
              value={year}
            />
          </div>
        </div>

        <Label className='text-lg font-semibold'>Fechamento mensal</Label>
        <DetailsRow>
          <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1'>
            <Label className='text-md font-medium'>Previsto</Label>
            <div className='text-3xl font-bold text-right'>{formatCurrency(billingData?.summary.totalAmount ?? 0)}</div>
            <div className='text-right text-sm'>{formatBillingCount(billingData?.summary.totalCount ?? 0)}</div>
          </div>
          <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1 text-green-600'>
            <Label className='text-md font-medium'>Pago</Label>
            <div className='text-3xl font-bold text-right'>{formatCurrency(billingData?.summary.paidAmount ?? 0)}</div>
            <div className='text-right text-sm'>{formatBillingCount(billingData?.summary.paidCount ?? 0)}</div>
          </div>
          <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1 text-rose-600'>
            <Label className='text-md font-medium'>Inadimplente</Label>
            <div className='text-3xl font-bold text-right'>{formatCurrency(billingData?.summary.defaultingAmount ?? 0)}</div>
            <div className='text-right text-sm'>{formatBillingCount(billingData?.summary.defaultingCount ?? 0)}</div>
          </div>
          <div className='bg-white border rounded-md p-4 flex flex-col gap-4 flex-1'>
            <Label className='text-md font-medium'>Pendente</Label>
            <div className='text-3xl font-bold text-right'>{formatCurrency(billingData?.summary.pendingAmount ?? 0)}</div>
            <div className='text-right text-sm'>{formatBillingCount(billingData?.summary.pendingCount ?? 0)}</div>
          </div>
        </DetailsRow>

        <div className='bg-white border rounded-md overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b text-left'>
                <th className='p-3'>Cliente</th>
                <th className='p-3'>CNPJ</th>
                <th className='p-3'>Vencimento</th>
                <th className='p-3 text-right'>Valor</th>
                <th className='p-3'>Status</th>
                <th className='p-3 text-right'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {
                billingData?.billings.map((billing) => (
                  <tr className='border-b last:border-b-0' key={billing.id}>
                    <td className='p-3'>{billing.client.fantasyName}</td>
                    <td className='p-3'>{applyCnpjMask(billing.client.cnpj)}</td>
                    <td className='p-3'>{formatDueDate(billing.dueDay, month, year)}</td>
                    <td className='p-3 text-right'>{formatCurrency(billing.amount)}</td>
                    <td className='p-3'>{BILLING_STATUS_TRANSLATION[billing.status]}</td>
                    <td className='p-3'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          onClick={() => updateBillingStatus(billing.id, 'paid')}
                          size="sm"
                          type="button"
                          variant={billing.status === 'paid' ? 'default' : 'outline'}
                        >
                          Pago
                        </Button>
                        <Button
                          onClick={() => updateBillingStatus(billing.id, 'defaulting')}
                          size="sm"
                          type="button"
                          variant={billing.status === 'defaulting' ? 'destructive' : 'outline'}
                        >
                          Inadimplente
                        </Button>
                        <Button
                          onClick={() => updateBillingStatus(billing.id, 'pending')}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Pendente
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              }
              {
                billingData?.billings.length === 0 && (
                  <tr>
                    <td className='p-6 text-center' colSpan={6}>Nenhuma cobrança encontrada.</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
