import { Outlet } from '@remix-run/react'

export default function Admin() {
  return (
    <div className="flex h-full w-full flex-col">
      <Outlet />
    </div>
  )
}
