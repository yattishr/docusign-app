"use client"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { toast, useToast } from "@/hooks/use-toast"
import { useLocalStorage } from 'usehooks-ts'

import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AccountSwitcher from "./account-switcher";
import SideBar from "./sidebar";
import ThreadList from "./thread-list";
import ThreadDisplay from "./thread-display";
import SearchBar from "@/components/mail/search-bar";
import AskAI from "@/components/mail/ask-ai";

type Props = {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
  defaultCollapsed: boolean;
};

const Mail = ({ defaultLayout = [20, 32, 48], navCollapsedSize, defaultCollapsed }: Props) => {
  const [ isCollapsed, setIsCollapsed ] = useState(defaultCollapsed)

  // Code for retrieving the Docusign authorization code from the URL
  const searchParams = useSearchParams();

  // Store/Retrieve the tokens to local storage.
  const [docusignAccessToken, setDocusignAccessToken] = useLocalStorage('docusignAccessToken', '');
  const [docusignRefreshToken, setDocusignRefreshToken] = useLocalStorage('docusignRefreshToken', '');

  useEffect(() => {
    const fetchTokens = async () => {
    // Get the code paramater from the URL
    const code = searchParams.get('code')
    
    if (code) {
      console.log(`--- Authorization Code: ${code} ---`)

      try {
        const response = await fetch("/api/docusign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ code }),
        })

        const data = await response.json()
        if (response.ok) {
          // Store tokens using useLocalStorage hook
          setDocusignAccessToken(data.access_token);
          setDocusignRefreshToken(data.refresh_token);

          toast({
            title: "Signify AI",
            description: "Sucessfully connected to DocuSign!",
          })
          console.log("Docusign Access token: ", data.access_token)
          console.log("Docusign Refresh token: ", data.refresh_token)
        } else {
          toast({
            title: "Signify AI",
            description: "Sorry, we could not connect to DocuSign. Please try again later.",
          })
          console.error("Error fetching Docusign Access tokens: ", data)
        }

      } catch (error) {
        console.error("Docusign Network error: ", error)
      }

    } else { 
      console.log(`--- No Authorization Code found in URL ---`)
      return 
    }   
  }
    fetchTokens();
  }, [searchParams])

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          console.log(sizes);
        }}
        className="h-full min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true)
          }}
          onResize={() => {
            setIsCollapsed(false)
          }}
          className={cn(isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out")}
        >
            <div className="flex flex-col h-full flex-1">
                <div className={cn("flex h-[52px] items-center justify-between", isCollapsed ? "h-[52px]": "px-2")}>
                    {/* Account Switcher - Sidebar */}
                    <AccountSwitcher isCollapsed={isCollapsed}/>
                </div>
                <Separator />
                {/* Sidebar */}
                <SideBar isCollapsed={isCollapsed}/>
                <div className="flex-1"></div>
                {/* Ask AI */}
                <AskAI isCollapsed={isCollapsed}/>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle/>
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="inbox">
            <div className="flex items-center px-4 py-2">
                <h1 className="text-xl font-bold">Inbox</h1>
                <TabsList className="ml-auto">
                    <TabsTrigger value="inbox" className="text-xinc-600 dark:text-zinc-200">
                        Inbox
                    </TabsTrigger>
                    <TabsTrigger value="done" className="text-xinc-600 dark:text-zinc-200">
                        Done
                    </TabsTrigger>                    
                </TabsList>
            </div>

            <Separator />
            
            {/* Search Bar */}
            <SearchBar />

            <TabsContent value="inbox">
                <ThreadList />
            </TabsContent>

            <TabsContent value="done">
              <ThreadList />
            </TabsContent>

          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
            {/* Thread Display here */}
            <ThreadDisplay />
        </ResizablePanel>
        
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default Mail;
