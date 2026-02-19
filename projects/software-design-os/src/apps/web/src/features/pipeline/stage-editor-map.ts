import type { StageName } from '@sdos/shared'
import type { ComponentType } from 'react'
import type { Stage } from '@sdos/shared'
import { StageEditorStub } from './stage-editor-stub'
import { ProductDefinitionEditor } from '@/features/stages/product-definition'
import { DataModelEditor } from '@/features/stages/data-model'
import { DatabaseDesignerEditor } from '@/features/stages/database-designer'
import { ApiDesignerEditor } from '@/features/stages/api-designer'

export interface StageEditorProps {
  stage: Stage
}

const editorMap: Record<StageName, ComponentType<StageEditorProps>> = {
  product: ProductDefinitionEditor,
  dataModel: DataModelEditor,
  database: DatabaseDesignerEditor,
  api: ApiDesignerEditor,
  stack: StageEditorStub,
  design: StageEditorStub,
  sections: StageEditorStub,
  infrastructure: StageEditorStub,
  export: StageEditorStub,
}

export function getStageEditor(stageName: StageName): ComponentType<StageEditorProps> {
  return editorMap[stageName] ?? StageEditorStub
}
