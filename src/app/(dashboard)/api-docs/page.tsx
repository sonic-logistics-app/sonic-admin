"use client";

import { Card } from "primereact/card";
import { Button } from "primereact/button";

export default function APIDocsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api/admin';
  const baseUrl = backendUrl.replace('/api/admin', '');
  const swaggerUrl = `${baseUrl}/api-docs`;

  const openSwaggerUI = () => {
    window.open(swaggerUrl, '_blank');
  };

  return (
    <div className="grid">
      <div className="col-12">
        <Card>
          <div className="text-center">
            <i className="pi pi-book text-6xl text-blue-500 mb-4"></i>
            <h2 className="text-900 mb-3">API Documentation</h2>
            <p className="text-600 mb-4 line-height-3">
              Interactive API documentation is available via Swagger UI. 
              Click the button below to access the complete API reference with request/response schemas.
            </p>
            
            <Button
              label="Open Swagger UI"
              icon="pi pi-external-link"
              size="large"
              onClick={openSwaggerUI}
              className="mb-4"
            />

            <div className="mt-5 text-left">
              <h5 className="text-900 mb-3">Available Endpoints</h5>
              
              <div className="grid">
                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-lock mr-2 text-blue-500"></i>
                      Authentication
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">POST /admin/login</li>
                      <li className="mb-2">POST /admin/register</li>
                      <li className="mb-2">POST /admin/logout</li>
                      <li className="mb-2">GET /admin/profile</li>
                      <li className="mb-2">PUT /admin/profile</li>
                      <li className="mb-2">PUT /admin/change-password</li>
                      <li className="mb-2">POST /admin/refresh-token</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-chart-bar mr-2 text-green-500"></i>
                      Dashboard
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/dashboard/stats</li>
                      <li className="mb-2">GET /admin/dashboard/latest-order</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-users mr-2 text-purple-500"></i>
                      User Management
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/user</li>
                      <li className="mb-2">PUT /admin/user/verify</li>
                      <li className="mb-2">DELETE /admin/user</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-car mr-2 text-cyan-500"></i>
                      Driver Management
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/driver</li>
                      <li className="mb-2">GET /admin/driver/:userId</li>
                      <li className="mb-2">PUT /admin/driver/verify</li>
                      <li className="mb-2">PUT /admin/driver/reject</li>
                      <li className="mb-2">DELETE /admin/driver</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-shop mr-2 text-orange-500"></i>
                      Vendor Management
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/vendor</li>
                      <li className="mb-2">POST /admin/vendor</li>
                      <li className="mb-2">GET /admin/vendor/:id</li>
                      <li className="mb-2">PUT /admin/vendor/:id</li>
                      <li className="mb-2">PUT /admin/vendor/:id/approve</li>
                      <li className="mb-2">PUT /admin/vendor/reject</li>
                      <li className="mb-2">PUT /admin/vendor/suspend</li>
                      <li className="mb-2">PUT /admin/vendor/activate</li>
                      <li className="mb-2">DELETE /admin/vendor/:id</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-truck mr-2 text-blue-500"></i>
                      Order Management
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/order</li>
                      <li className="mb-2">GET /admin/order/:orderId</li>
                      <li className="mb-2">POST /admin/order/:order_id/generate-code</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-ticket mr-2 text-pink-500"></i>
                      Voucher Management
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/voucher</li>
                      <li className="mb-2">POST /admin/voucher</li>
                      <li className="mb-2">GET /admin/voucher/:voucherId</li>
                      <li className="mb-2">PUT /admin/voucher/:voucherId</li>
                      <li className="mb-2">DELETE /admin/voucher</li>
                    </ul>
                  </Card>
                </div>

                <div className="col-12 md:col-6">
                  <Card className="mb-3">
                    <h6 className="text-900 mb-2">
                      <i className="pi pi-question-circle mr-2 text-indigo-500"></i>
                      FAQ & Support
                    </h6>
                    <ul className="list-none p-0 m-0 text-600">
                      <li className="mb-2">GET /admin/faq</li>
                      <li className="mb-2">POST /admin/faq</li>
                      <li className="mb-2">GET /admin/faq/:faqId</li>
                      <li className="mb-2">PUT /admin/faq/:faqId</li>
                      <li className="mb-2">DELETE /admin/faq</li>
                      <li className="mb-2">GET /admin/support/contact-info</li>
                      <li className="mb-2">PUT /admin/support/contact-info</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border-round">
              <div className="flex align-items-center">
                <i className="pi pi-info-circle text-blue-600 mr-2"></i>
                <span className="text-blue-900">
                  All endpoints support pagination with <code>page</code>, <code>limit</code>, and <code>search</code> query parameters.
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
