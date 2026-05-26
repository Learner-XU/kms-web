import LeftNav from "@/components/LeftNav"
import FileBrowser from "@/components/FileBrowser"
import MainEditor from "@/components/MainEditor"
import RightSidebar from "@/components/RightSidebar"

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <LeftNav />
      <FileBrowser />
      <MainEditor />
      <RightSidebar />
    </div>
  )
}
