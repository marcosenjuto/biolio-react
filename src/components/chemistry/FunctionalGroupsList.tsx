import { useState } from 'react'
import RDKitMoleculeViewer from './RDKitMoleculeViewer'
import Card from '@/components/ui/Card'

// Sintaxis CXSMILES para R-groups
const rGroupStructures = [
  {
    id: 'alcohol',
    name: 'Alcohol',
    smiles: '*O |$R;;$|',
    description: 'Generic alcohol group (R-OH)'
  },
  {
    id: 'aldehyde',
    name: 'Aldehyde',
    smiles: '*C=O |$R;;;$|',
    description: 'Aldehyde group (R-CHO)'
  },
  {
    id: 'acetal',
    name: 'Acetal',
    smiles: '*C(O*)(O*) |$R;;R1;;R1;$|',
    description: 'Acetal group (R-CH(OR¹)(OR¹))'
  },
  {
    id: 'ester',
    name: 'Ester',
    smiles: '*C(=O)O* |$R1;;;;R2$|',
    description: 'Ester group (R¹-COO-R²)'
  },
  {
    id: 'ketone',
    name: 'Ketone',
    smiles: '*C(=O)* |$R1;;;R2$|',
    description: 'Ketone group (R¹-CO-R²)'
  },
  {
    id: 'amide',
    name: 'Amide',
    smiles: '*C(=O)N* |$R1;;;;R2$|',
    description: 'Amide group (R¹-CO-NH-R²)'
  }
]

interface FunctionalGroupsListProps {
  className?: string
  onSelectGroup?: (groupId: string) => void
  selectedGroupId?: string
}

export default function FunctionalGroupsList({ 
  className = '', 
  onSelectGroup,
  selectedGroupId 
}: FunctionalGroupsListProps) {
  return (
    <div className={`functional-groups-list grid grid-cols-2 xxs:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 ${className}`}>
      {rGroupStructures.map((group) => (
        <Card 
          key={group.id}
          className={`
            functional-group-card p-1 cursor-pointer transition-all hover:shadow-md border-2
            ${selectedGroupId === group.id ? 'border-primary-500 bg-primary-50' : 'border-transparent hover:border-gray-200'}
          `}
          onClick={() => onSelectGroup?.(group.id)}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start ">
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              {selectedGroupId === group.id && (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                  Selected
                </span>
              )}
            </div>
            
            <div className="molecule-preview rounded-lg border border-gray-200 p-0 mb-3 flex-grow flex items-center justify-center min-w-[120px]">
              <RDKitMoleculeViewer 
                smiles={group.smiles} 
                width="100%" 
                height="auto" 
              />
            </div>
            
            <div className="group-info">
              <p className="text-sm text-gray-600 mb-1">{group.description}</p>
              <code className="text-xs bg-gray-100 text-gray-500 px-1 py-0.5 rounded block truncate" title={group.smiles}>
                {group.smiles}
              </code>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
