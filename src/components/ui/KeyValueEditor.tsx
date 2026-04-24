import React from 'react'
import { FieldArrayWithId, UseFormRegister, FieldErrors } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from './Input'
import { Button } from './Button'

interface KeyValueEditorProps {
  fields: FieldArrayWithId<any, any, 'id'>[]
  onAdd: () => void
  onRemove: (index: number) => void
  register: UseFormRegister<any>
  name: string
  errors?: FieldErrors<any>
}

export const KeyValueEditor: React.FC<KeyValueEditorProps> = ({
  fields,
  onAdd,
  onRemove,
  register,
  name,
  errors
}) => {
  return (
    <div className="space-y-2">
      <div className="space-y-2">
        {fields.map((field, index) => {
          const fieldErrors = (errors as any)?.[index]
          return (
            <div key={field.id} className="flex gap-2 items-start animate-in fade-in duration-200">
              <div className="w-[40%]">
                <Input
                  placeholder="Key"
                  {...register(`${name}.${index}.key`)}
                  error={fieldErrors?.key?.message}
                />
              </div>
              <div className="w-[40%]">
                <Input
                  placeholder="Value"
                  {...register(`${name}.${index}.value`)}
                  error={fieldErrors?.value?.message}
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
