'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import CurrencyInput from 'react-currency-input-field'
import DashboardLayout from '@/components/DashboardLayout'
import { DetailsRow } from '@/components/DetailsRow'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputContainer } from '@/components/InputContainer'
import InputMask from "react-input-mask"
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sendRequest } from '@/lib/sendRequest'
import { sendHotsiteRequest } from '@/lib/sendHotsiteRequest'
import { STATUS } from '@/lib/enums'
import { useToast } from '@/components/ui/use-toast'
import { transformCurrencyStringToNumber, formatCurrency, applyCurrencyMaskReturningString } from '@/lib/utils'
import { useState } from 'react'

const newClientFormSchema = z.object({
  cnpj: z
    .string({ required_error: 'O campo CNPJ é obrigatório.' })
    .min(14, { message: 'O campo CNPJ deve ter pelo menos 14 caracteres.' })
    .max(18, { message: 'O campo CNPJ deve ter no máximo 18 caracteres.' }),
  corporateName: z
    .string({ required_error: 'O campo Razão Social é obrigatório.' })
    .min(3, {  message: 'O campo Razão Social deve ter pelo menos 3 caracteres.' }),
  fantasyName: z
    .string({ required_error: 'O campo Nome Fantasia é obrigatório.' })
    .min(3, { message: 'O campo Nome Fantasia deve ter pelo menos 3 caracteres.' }),
  segment: z
    .string({ required_error: 'O campo Segmento é obrigatório.' })
    .min(3, { message: 'O campo Segmento deve ter pelo menos 3 caracteres.' }),
  address: z
    .string({ required_error: 'O campo Endereço é obrigatório.' })
    .min(3, { message: 'O campo Endereço deve ter pelo menos 3 caracteres.' }),
  state: z
    .string({ required_error: 'O campo Estado é obrigatório.' })
    .length(2, { message: 'O campo Estado deve ter 2 caracteres.' }),
  city: z
    .string({required_error: 'O campo Cidade é obrigatório.' })
    .min(3, { message: 'O campo Cidade deve ter pelo menos 3 caracteres.' }),
  managerName: z
    .string({required_error: 'O campo Nome do Responsável é obrigatório.'})
    .min(3, {message: 'O campo Nome do Responsável deve ter pelo menos 3 caracteres.'}),
  managerPhoneNumber: z
    .string({ required_error: 'O campo Telefone do Responsável é obrigatório.' })
    .min(10, { message: 'O campo Telefone do Responsável deve ter pelo menos 10 caracteres.' }),
  managerEmail: z
    .string({ required_error: 'O campo E-mail do Responsável é obrigatório.' })
    .email({ message: 'O campo E-mail do Responsável deve ser um e-mail válido.' }),
  financePhoneNumber: z
    .string({ required_error: 'O campo Telefone do Financeiro é obrigatório.' })
    .min(10, { message: 'O campo Telefone do Financeiro deve ter pelo menos 10 caracteres.' }),
  lumpSum: z.coerce
    .number({ required_error: 'O campo Valor do Boleto é obrigatório.' })
    .gte(0, { message: 'O campo Valor do Boleto deve ser maior ou igual a 0.' })
    .optional()
    .transform(value => Math.floor(value || 0)),
  unitValue: z.coerce
    .number({ required_error: 'O campo Valor Unitário é obrigatório.' })
    .gte(0, { message: 'O campo Valor Unitário deve ser maior ou igual a 0.' })
    .optional()
    .transform(value => Math.floor(value || 0)),
  contractUrl: z
    .string({ required_error: 'O campo URL do Contrato é obrigatório.' })
    .url({ message: 'O campo URL do Contrato deve ser uma URL válida.' })
    .optional(),
  statusId: z.coerce
    .number({ required_error: 'O campo Status é obrigatório.' })
    .gte(1, { message: 'O campo Status deve 1 (ativo), 2 (inativo) ou 3 (excluído).' })
    .lte(3, { message: 'O campo Status deve 1 (ativo), 2 (inativo) ou 3 (excluído).' }),
  urlSite: z
    .string({ required_error: 'O campo URL Site é obrigatório.' })
    .min(3, {  message: 'O campo URL Site deve ter pelo menos 3 caracteres.' }),
  primaryColor: z
    .string({ required_error: 'O campo Cor Primária é obrigatório.' })
    .min(3, { message: 'O campo Cor Primária deve ter pelo menos 3 caracteres.' })
    .max(7, { message: 'O campo Cor Primária deve ter no máximo 7 caracteres.' }),
  secondColor: z 
    .string({ required_error: 'O campo Cor Secundária é obrigatório.' })
    .min(3, { message: 'O campo Cor Secundária deve ter pelo menos 3 caracteres.' })
    .max(7, { message: 'O campo Cor Secundária deve ter no máximo 7 caracteres.' }),
})

type NewClientFormSchema = z.infer<typeof newClientFormSchema>


const NEW_CLIENT_FORM_DEFAULT_VALUES: NewClientFormSchema = {
  cnpj: '',
  corporateName: '',
  fantasyName: '',
  segment: '',
  address: '',
  state: '',
  city: '',
  managerName: '',
  managerPhoneNumber: '',
  managerEmail: '',
  financePhoneNumber: '',
  lumpSum: 0,
  unitValue: 0,
  contractUrl: '',
  statusId: STATUS.Ativo,
  urlSite: '',
  primaryColor: '',
  secondColor: '',

}

export default function RegisterClient() {
  const form = useForm<NewClientFormSchema>({
    mode: 'onBlur',
    defaultValues: NEW_CLIENT_FORM_DEFAULT_VALUES,
    resolver: zodResolver(newClientFormSchema)
  })

  const { back } = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState('');

  const formatNewClientData = (newClientData: NewClientFormSchema): NewClientFormSchema => ({
    ...newClientData,
    cnpj: newClientData.cnpj
      .replaceAll('.', '').replace('/', '').replace('-', '').replaceAll('_', ''),
    managerPhoneNumber: newClientData.managerPhoneNumber
      .replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replaceAll('_', ''),
    financePhoneNumber: newClientData.financePhoneNumber
      .replace('(', '').replace(')', '').replace('-', '').replace(' ', '').replaceAll('_', '')
  })

  const postClient = async (newClientData: NewClientFormSchema) => {
    const formattedNewClientData = formatNewClientData(newClientData)
    
    const response = await sendRequest({
      endpoint: '/client',
      method: 'POST',
      data: formattedNewClientData
    })

    if (response.error) {
      toast({
        description: response.message,
        variant: 'destructive'
      })
    } else {
        const formData = new FormData();
        const responseData:any  =  response.data;
        formData.append('id', responseData.clientId);
        formData.append('image', file)
        formData.append('urlSite', newClientData.urlSite)
        formData.append('primaryColor', newClientData.primaryColor)
        formData.append('secondColor', newClientData.secondColor)
        const hotsiteResponse = await sendHotsiteRequest({
          endpoint: '/addSite',
          method: 'POST',
          data: formData
        })
      toast({
        description: response.message
      })
    }

  back()
  }

  return (
    <DashboardLayout title="Cadastrar Novo Cliente">
      <Form { ...form }>
        <form
          className='flex flex-col my-4 gap-4'
          onSubmit={form.handleSubmit((data) => postClient(data))}
        >
          <DetailsRow>
            <InputContainer size="w-1/2">
              <Label htmlFor="fantasyName">Nome Fantasia</Label>
              <Input className="bg-white" { ...form.register("fantasyName") } />
              {
                form.formState.errors.fantasyName
                  && <span className="text-red-500 text-xs">{form.formState.errors.fantasyName.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/2">
              <Label htmlFor="corporateName">Razão Social</Label>
              <Input className="bg-white" { ...form.register("corporateName") } />
              {
                form.formState.errors.corporateName
                  && <span className="text-red-500 text-xs">{form.formState.errors.corporateName.message}</span>
              }
            </InputContainer>
          </DetailsRow>

          <DetailsRow>
            <InputContainer size="w-1/3">
              <Label htmlFor="cnpj">CNPJ</Label>
              <InputMask
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                mask="99.999.999/9999-99"
                { ...form.register("cnpj",) }
              />
              {
                form.formState.errors.cnpj
                  && <span className="text-red-500 text-xs">{form.formState.errors.cnpj.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/3">
              <Label htmlFor="segment">Segmento</Label>
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Proteção Veicular">Proteção Veicular</SelectItem>
                        <SelectItem value="Telecom">Telecom</SelectItem>
                        <SelectItem value="Plano Funerário">Plano Funerário</SelectItem>
                        <SelectItem value="RH">RH</SelectItem>
                        <SelectItem value="Sindicato">Sindicato</SelectItem>
                        <SelectItem value="Associação">Associação</SelectItem>
                        <SelectItem value="Clube de benefícios">Clube de benefícios</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {
                form.formState.errors.segment
                  && <span className="text-red-500 text-xs">{form.formState.errors.segment.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/3">
              <Label htmlFor="statusId">Status</Label>
              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{STATUS[1]}</SelectItem>
                        <SelectItem value="2">{STATUS[2]}</SelectItem>
                        <SelectItem value="3">{STATUS[3]}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              {
                form.formState.errors.statusId
                  && <span className="text-red-500 text-xs">{form.formState.errors.statusId.message}</span>
              }
            </InputContainer>
          </DetailsRow>

          <DetailsRow>
            {/* <InputContainer size="w-1/3">
              <Label htmlFor="lumpSum">Valor do Boleto</Label>
              <CurrencyInput
                { ...form.register("lumpSum") }
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                allowNegativeValue={false}
                fixedDecimalLength={2}
                disableGroupSeparators={true}
                placeholder="00.00"
              />
              {
                form.formState.errors.lumpSum
                  && <span className="text-red-500 text-xs">{form.formState.errors.lumpSum.message}</span>
              }
            </InputContainer> */}
            <InputContainer size="w-1/3">
              <Label htmlFor="lumpSum">Valor do Boleto</Label>
              <Input
                className="bg-white"
                type="number"
                { ...form.register("lumpSum") }
              />
              {
                form.formState.errors.lumpSum
                  && <span className="text-red-500 text-xs">{form.formState.errors.lumpSum.message}</span>
              }
            </InputContainer>
            {/* <InputContainer size="w-1/3">
              <Label htmlFor="unitValue">Valor Unitário</Label>
              <CurrencyInput
                { ...form.register("unitValue") }
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                allowNegativeValue={false}
                fixedDecimalLength={2}
                disableGroupSeparators={true}
                placeholder="00.00"
              />
              {
                form.formState.errors.unitValue
                  && <span className="text-red-500 text-xs">{form.formState.errors.unitValue.message}</span>
              }
            </InputContainer> */}
            <InputContainer size="w-1/3">
              <Label htmlFor="unitValue">Valor Unitário</Label>
              <Input
                className="bg-white"
                type="number"
                { ...form.register("unitValue") }
              />
              {
                form.formState.errors.unitValue
                  && <span className="text-red-500 text-xs">{form.formState.errors.unitValue.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/3">
              <Label htmlFor="contractUrl">URL do Contrato</Label>
              <Input className="bg-white" { ...form.register("contractUrl") } />
              {
                form.formState.errors.contractUrl
                  && <span className="text-red-500 text-xs">{form.formState.errors.contractUrl.message}</span>
              }
            </InputContainer>
          </DetailsRow>

          <DetailsRow>
            <InputContainer size="w-1/2">
              <Label htmlFor="managerName">Nome do Responsável</Label>
              <Input className="bg-white" { ...form.register("managerName") } />
              {
                form.formState.errors.managerName
                  && <span className="text-red-500 text-xs">{form.formState.errors.managerName.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/2">
              <Label htmlFor="managerEmail">E-mail do Responsável</Label>
              <Input className="bg-white" { ...form.register("managerEmail") } />
              {
                form.formState.errors.managerEmail
                  && <span className="text-red-500 text-xs">{form.formState.errors.managerEmail.message}</span>
              }
            </InputContainer>
          </DetailsRow>

          <DetailsRow>
            <InputContainer size="w-1/2">
              <Label htmlFor="managerPhoneNumber">Telefone do Responsável</Label>
              <InputMask
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                mask="(99) 999999999"
                { ...form.register("managerPhoneNumber",) }
              />
              {
                form.formState.errors.managerPhoneNumber
                  && <span className="text-red-500 text-xs">{form.formState.errors.managerPhoneNumber.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/2">
              <Label htmlFor="financePhoneNumber">Telefone do Financeiro</Label>
              <InputMask
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                mask="(99) 999999999"
                { ...form.register("financePhoneNumber",) }
              />
              {
                form.formState.errors.financePhoneNumber
                  && <span className="text-red-500 text-xs">{form.formState.errors.financePhoneNumber.message}</span>
              }
            </InputContainer>
          </DetailsRow>

          <DetailsRow>
            <InputContainer size="w-1/3">
              <Label htmlFor="address">Endereço</Label>
              <Input className="bg-white" { ...form.register("address") } />
              {
                form.formState.errors.address
                  && <span className="text-red-500 text-xs">{form.formState.errors.address.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/3">
              <Label htmlFor="city">Cidade</Label>
              <Input className="bg-white" { ...form.register("city") } />
              {
                form.formState.errors.city
                  && <span className="text-red-500 text-xs">{form.formState.errors.city.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/3">
              <Label htmlFor="state">Estado</Label>
              <InputMask
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                mask="aa"
                { ...form.register("state",) }
              />
              {
                form.formState.errors.state
                  && <span className="text-red-500 text-xs">{form.formState.errors.state.message}</span>
              }
            </InputContainer>
          </DetailsRow>

          <DetailsRow>
            <InputContainer size="w-1/5">
              <Label htmlFor="urlSite">Url Site</Label>
              <Input className="bg-white" { ...form.register("urlSite") } />
              {
                form.formState.errors.urlSite && <span className="text-red-500 text-xs">{form.formState.errors.urlSite.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/4">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <Input className="bg-white" { ...form.register("primaryColor") } />
              {
                form.formState.errors.primaryColor && <span className="text-red-500 text-xs">{form.formState.errors.primaryColor.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/4">
              <Label htmlFor="secondColor">Cor Secundária</Label>
              <Input className="bg-white" { ...form.register("secondColor") } />
              {
                form.formState.errors.secondColor && <span className="text-red-500 text-xs">{form.formState.errors.secondColor.message}</span>
              }
            </InputContainer>
            <InputContainer size="w-1/3">
              <Label htmlFor="image">Imagem</Label>
              <Input className="bg-white"  onChange={(e: React.ChangeEvent<any>) => setFile(e.target.files[0])} type='file' />
            </InputContainer>
          </DetailsRow>

          <Button className="my-4" disabled={!form.formState.isValid} type='submit'>
            Cadastrar cliente
          </Button>
        </form>
      </Form>
    </DashboardLayout>
  )
}
