import { UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from './Input'
import { Button } from './Button'

interface KeyValueEditorProps {
  fields: Array<{ id: string }>
  onAdd: () => void
  onRemove: (index: number) => void
  register: UseFormRegister<Record<string, unknown>>
  name: string
  errors?: unknown
}

export const KeyValueEditor = ({
  fields,
  onAdd,
  onRemove,
  register,
  name,
  errors
}: KeyValueEditorProps) => {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {fields.map((field, index) => {
          const indexedErrors = Array.isArray(errors) ? (errors[index] as { key?: { message?: string }; value?: { message?: string } }) : undefined
          return (
            <div key={field.id} className="flex gap-2 items-start animate-in fade-in duration-200">
              <div className="w-[40%]">
                <Input
                  placeholder="Key"
                  {...register(`${name}.${index}.key`)}
                  error={typeof indexedErrors?.key?.message === 'string' ? indexedErrors.key.message : undefined}
                />
              </div>
              <div className="w-[40%]">
                <Input
                  placeholder="Value"
                  {...register(`${name}.${index}.value`)}
                  error={typeof indexedErrors?.value?.message === 'string' ? indexedErrors.value.message : undefined}
                />
              </div>
              <div className="w-[20%] flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-10 h-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-slate-200"
                  onClick={() => onRemove(index)}
                  title="Remove field"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 border-dashed border-slate-300 text-slate-600 hover:text-slate-900"
      >
        <Plus className="w-4 h-4" /> Add Field
      </Button>
    </div>
  )
}
