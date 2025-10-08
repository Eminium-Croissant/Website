import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function SwaggerPage() {
  return (
    <>
      <style>
        {`
        .swagger-ui,
        .scheme-container,
        .opblock-section-header,
        select, input{
          background: none !important;
        }

        *[class^="modal-"] {
          background: #1e1e1e !important;
          color: #fff !important;
        }

        .scheme-container, .info {
          display: none !important;
        }

        .swagger-ui * {
          color: #fff !important;
        }
      `}
      </style>
      <div style={{ height: '100vh', background: 'none', color: '#fff', marginBottom: '50px' }}>
        <SwaggerUI url='/croissant_swagger.json' deepLinking={true} style={{ marginBottom: '50px' }} />
      </div>
    </>
  );
}
