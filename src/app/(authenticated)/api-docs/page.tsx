"use client";

export default function APIDocsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
  const baseUrl = backendUrl.replace('/api/admin', '');
  const swaggerUrl = `${baseUrl}/api-docs`;

  const openSwaggerUI = () => {
    window.open(swaggerUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Documentation Card */}
      <div className="bg-white border border-[#E1E4EA] rounded-2xl p-12 text-center">
        <i className="pi pi-book text-[80px] text-[#2563EB] mb-6 block"></i>
        <h1 className="text-[32px] font-bold text-[#111827] mb-4">API Documentation</h1>
        <p className="text-[16px] text-[#525866] mb-8 max-w-3xl mx-auto leading-relaxed">
          Complete, interactive API documentation is available via Swagger UI. 
          All endpoints, request/response schemas, and examples are automatically generated 
          and always up-to-date with the latest backend implementation.
        </p>
        
        <button
          onClick={openSwaggerUI}
          className="inline-flex items-center gap-3 px-8 py-4 bg-[#2563EB] text-white rounded-lg text-[16px] font-semibold hover:bg-[#1d4ed8] transition-colors shadow-lg hover:shadow-xl"
        >
          <i className="pi pi-external-link text-[18px]"></i>
          Open Interactive API Documentation
        </button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6 text-center">
          <i className="pi pi-shield text-[32px] text-[#059669] mb-3 block"></i>
          <h3 className="text-[16px] font-semibold text-[#111827] mb-2">Authentication</h3>
          <p className="text-[13px] text-[#525866]">
            Bearer token authentication required for most endpoints
          </p>
        </div>

        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6 text-center">
          <i className="pi pi-database text-[32px] text-[#7C3AED] mb-3 block"></i>
          <h3 className="text-[16px] font-semibold text-[#111827] mb-2">Complete Coverage</h3>
          <p className="text-[13px] text-[#525866]">
            All admin endpoints including users, drivers, vendors, orders & more
          </p>
        </div>

        <div className="bg-white border border-[#E1E4EA] rounded-lg p-6 text-center">
          <i className="pi pi-sync text-[32px] text-[#DC2626] mb-3 block"></i>
          <h3 className="text-[16px] font-semibold text-[#111827] mb-2">Always Current</h3>
          <p className="text-[13px] text-[#525866]">
            Auto-generated from backend code - never outdated
          </p>
        </div>
      </div>

      {/* Base URL Info */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-6">
        <h3 className="text-[16px] font-semibold text-[#111827] mb-3 flex items-center gap-2">
          <i className="pi pi-server text-[#2563EB]"></i>
          API Base URL
        </h3>
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-4">
          <code className="text-[14px] font-mono text-[#059669] break-all">
            {backendUrl}
          </code>
        </div>
        <p className="text-[13px] text-[#64748B] mt-3">
          All API endpoints are prefixed with this base URL. Authentication header: 
          <code className="bg-white px-2 py-1 rounded text-[12px] font-mono ml-1">Authorization: Bearer &lt;token&gt;</code>
        </p>
      </div>
    </div>
  );
}
