"use client";

export default function APIDocsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
  const baseUrl = backendUrl.replace('/api/admin', '');
  const swaggerUrl = `${baseUrl}/api-docs`;

  const openSwaggerUI = () => {
    window.open(swaggerUrl, '_blank');
  };

  const endpoints = [
    {
      title: "Authentication",
      icon: "pi-lock",
      color: "text-[#2563EB]",
      items: [
        "POST /admin/login",
        "POST /admin/register",
        "POST /admin/logout",
        "GET /admin/profile",
        "PUT /admin/profile",
        "PUT /admin/change-password",
        "POST /admin/refresh-token",
      ],
    },
    {
      title: "Dashboard",
      icon: "pi-chart-bar",
      color: "text-[#059669]",
      items: [
        "GET /admin/dashboard/stats",
        "GET /admin/dashboard/latest-order",
      ],
    },
    {
      title: "User Management",
      icon: "pi-users",
      color: "text-[#9c27b0]",
      items: [
        "GET /admin/user",
        "PUT /admin/user/verify",
        "DELETE /admin/user",
      ],
    },
    {
      title: "Driver Management",
      icon: "pi-car",
      color: "text-[#06b6d4]",
      items: [
        "GET /admin/driver",
        "GET /admin/driver/:userId",
        "PUT /admin/driver/verify",
        "PUT /admin/driver/reject",
        "DELETE /admin/driver",
      ],
    },
    {
      title: "Vendor Management",
      icon: "pi-shop",
      color: "text-[#f97316]",
      items: [
        "GET /admin/vendor",
        "POST /admin/vendor",
        "GET /admin/vendor/:id",
        "PUT /admin/vendor/:id",
        "PUT /admin/vendor/:id/approve",
        "PUT /admin/vendor/reject",
        "PUT /admin/vendor/suspend",
        "PUT /admin/vendor/activate",
        "DELETE /admin/vendor/:id",
      ],
    },
    {
      title: "Order Management",
      icon: "pi-truck",
      color: "text-[#2563EB]",
      items: [
        "GET /admin/order",
        "GET /admin/order/:orderId",
        "POST /admin/order/:order_id/generate-code",
      ],
    },
    {
      title: "Voucher Management",
      icon: "pi-ticket",
      color: "text-[#ec4899]",
      items: [
        "GET /admin/voucher",
        "POST /admin/voucher",
        "GET /admin/voucher/:voucherId",
        "PUT /admin/voucher/:voucherId",
        "DELETE /admin/voucher",
      ],
    },
    {
      title: "FAQ & Support",
      icon: "pi-question-circle",
      color: "text-[#6366f1]",
      items: [
        "GET /admin/faq",
        "POST /admin/faq",
        "GET /admin/faq/:faqId",
        "PUT /admin/faq/:faqId",
        "DELETE /admin/faq",
        "GET /admin/support/contact-info",
        "PUT /admin/support/contact-info",
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white border border-[#E1E4EA] rounded-2xl p-8 text-center">
        <i className="pi pi-book text-[64px] text-[#2563EB] mb-4 block"></i>
        <h1 className="text-[28px] font-bold text-[#111827] mb-3">API Documentation</h1>
        <p className="text-[13px] text-[#525866] mb-6 max-w-2xl mx-auto leading-relaxed">
          Interactive API documentation is available via Swagger UI. Click the button below to access the complete API reference with request/response schemas.
        </p>
        
        <button
          onClick={openSwaggerUI}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
        >
          <i className="pi pi-external-link"></i>
          Open Swagger UI
        </button>
      </div>

      {/* Endpoints Grid */}
      <div>
        <h2 className="text-[18px] font-semibold text-[#111827] mb-4">Available Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {endpoints.map((section, idx) => (
            <div key={idx} className="bg-white border border-[#E1E4EA] rounded-lg p-5">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <i className={`pi ${section.icon} ${section.color}`}></i>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="text-[12px] text-[#525866] font-mono bg-[#F9FAFB] px-3 py-2 rounded">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-[#DBEAFE] border border-[#2563EB] rounded-lg p-4 flex items-start gap-3">
        <i className="pi pi-info-circle text-[#2563EB] text-[16px] mt-1 flex-shrink-0"></i>
        <p className="text-[13px] text-[#1e40af]">
          All endpoints support pagination with <code className="bg-white px-2 py-1 rounded text-[11px] font-mono">page</code>, <code className="bg-white px-2 py-1 rounded text-[11px] font-mono">limit</code>, and <code className="bg-white px-2 py-1 rounded text-[11px] font-mono">search</code> query parameters.
        </p>
      </div>
    </div>
  );
}
