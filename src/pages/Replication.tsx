import { ReplicationOrchestration } from "../components/ReplicationOrchestration";
import { ToastContainer } from "react-toastify";

export const ReplicationPage = () => {
  return (
    <div>
      <ToastContainer position="bottom-right" newestOnTop />
      <ReplicationOrchestration />
    </div>
  )
}