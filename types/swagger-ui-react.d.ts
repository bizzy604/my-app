declare module 'swagger-ui-react' {
  import { ComponentType } from 'react';
  
  export interface SwaggerUIProps {
    spec?: object;
    url?: string;
    layout?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelExpandDepth?: number;
    defaultModelsExpandDepth?: number;
    displayOperationId?: boolean;
    plugins?: Array<object>;
    supportedSubmitMethods?: Array<string>;
    deepLinking?: boolean;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
    showMutatedRequest?: boolean;
    defaultModelRendering?: 'example' | 'model';
    presets?: Array<any>;
    [key: string]: any;
  }
  
  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}
