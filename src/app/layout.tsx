"use client";

import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { Geist } from "next/font/google";

const queryClient = new QueryClient();

const geistMono = Geist({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [sidebarIsopen, setSidebarIsopen] = useState(true);

	return (
		<html lang="en">
			<body className={geistMono.className}>
				<QueryClientProvider client={queryClient}>
					<ClerkProvider
						appearance={{
							baseTheme: dark,
							signIn: { baseTheme: dark },
						}}
					>
						<SignedIn>
							<div
								className="min-h-screen bg-[#0A1219] text-white p-8"
								style={{
									backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='100' viewBox='0 0 56 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='%23193549' stroke-opacity='0.3' stroke-width='1'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='%23193549' stroke-opacity='0.3' stroke-width='1'/%3E%3C/svg%3E")`,
									backgroundSize: "56px 100px",
								}}
							>
								<SidebarProvider open={sidebarIsopen} onOpenChange={setSidebarIsopen}>
									<AppSidebar />
									<main className="w-full">
										<SidebarTrigger />
										{children}
									</main>
									<Toaster />
								</SidebarProvider>
							</div>
						</SignedIn>
						<SignedOut>
							<RedirectToSignIn />
						</SignedOut>
					</ClerkProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
