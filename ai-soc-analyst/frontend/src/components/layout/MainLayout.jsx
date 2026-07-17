import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * MainLayout wraps every page with the persistent sidebar and navbar.
 * Child routes render into the <Outlet /> slot.
 */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-soc-bg">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main content area offset by sidebar width (w-60 = 15rem) */}
      <div className="flex-1 ml-60 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
