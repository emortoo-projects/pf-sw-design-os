import type { StageName } from '@sdos/shared'
import type { ComponentType } from 'react'
import type { Stage } from '@sdos/shared'
import { StageEditorStub } from './stage-editor-stub'
import { ProductDefinitionEditor } from '@/features/stages/product-definition'
import { DataModelEditor } from '@/features/stages/data-model'
import { DatabaseDesignerEditor } from '@/features/stages/database-designer'
import { ApiDesignerEditor } from '@/features/stages/api-designer'
import { StackSelectorEditor } from '@/features/stages/stack-selector'
import { DesignSystemEditor } from '@/features/stages/design-system'
import { SectionBuilderEditor } from '@/features/stages/section-builder'
import { InfrastructureEditor } from '@/features/stages/infrastructure'
import { ExportPreviewEditor } from '@/features/stages/export-preview'

export interface StageEditorProps {
  stage: Stage
}

const editorMap: Record<StageName, ComponentType<StageEditorProps>> = {
  product: ProductDefinitionEditor,
  dataModel: DataModelEditor,
  database: DatabaseDesignerEditor,
  api: ApiDesignerEditor,
  stack: StackSelectorEditor,
  design: DesignSystemEditor,
  sections: SectionBuilderEditor,
  infrastructure: InfrastructureEditor,
  export: ExportPreviewEditor,
}

export function getStageEditor(stageName: StageName): ComponentType<StageEditorProps> {
  return editorMap[stageName] ?? StageEditorStub
}
