"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Web3Provider } from "@/lib/web3/Web3Provider"
import { useWeb3 } from "@/lib/web3/Web3Provider"
import { ContractService } from "@/lib/web3/contractService" // Assuming this exists and is correctly set up
import { WalletConnect } from "@/components/blockchain/WalletConnect" // Assuming this exists
import { ManufacturerPanel } from "@/components/blockchain/ManufacturerPanel" // Assuming this exists
import { RetailerPanel } from "@/components/blockchain/RetailerPanel" // Assuming this exists
import { MedicineTracker } from "@/components/blockchain/MedicineTracker" // Assuming this exists
import { Toaster } from "sonner"
import { Clock, Package, Info, Hash, User, BarChart3, Factory, ShoppingBag, Home, ArrowUpRight, Fuel, ArrowDownRight } from "lucide-react" // Added Fuel, ArrowDownRight
import { ethers } from "ethers"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Dock from "@/components/ui/dock" // Assuming this exists
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import Waves from '@/components/ui/waves' // Assuming this exists


// Types for blockchain data
interface BlockData {
  id: number;
  timestamp: Date;
  transactions: number;
  gasUsed: number; // Ensure this is always a number after fetching
}

// Placeholder for MedicineList - replace with your actual component or remove if not used
function MedicineList() {
  return null; // Return null if it's not implemented yet
}


function DashboardContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState("track")
  const { contract, isConnected } = useWeb3()
  const [blocks, setBlocks] = useState<BlockData[]>([])
  const [blockCount, setBlockCount] = useState<number>(0)

  const [isLoading, setIsLoading] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<ethers.providers.Block | null>(null)
  const [isLoadingBlockDetails, setIsLoadingBlockDetails] = useState(false)

  useEffect(() => {
    const validTabs = ["track", "manufacturer", "retailer"];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);


  // Fetch blockchain data when connected or connection status changes
  useEffect(() => {
    if (isConnected && contract?.provider) {
      fetchBlockchainData();
    } else {
      // Reset state if disconnected or contract/provider not available
      setBlocks([]);
      setBlockCount(0);
      setSelectedBlock(null); // Also clear selected block
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, contract]); // Rerun when connection status or contract changes


  const fetchBlockchainData = async () => {
    if (!contract?.provider || !isConnected) {
       console.log("Fetch skipped: Not connected or provider missing.");
       setBlocks([]); setBlockCount(0); setIsLoading(false); return;
    }
    setIsLoading(true); console.log("Fetching blockchain data...");
    try {
      const provider = contract.provider as ethers.providers.Web3Provider;
      const currentBlockNumber = await provider.getBlockNumber();
      console.log("Current block number:", currentBlockNumber);
      setBlockCount(currentBlockNumber);
      const fetchLimit = Math.min(Math.max(0, currentBlockNumber + 1), 50);
      console.log("Fetching last", fetchLimit, "blocks");
      const blockPromises = [];
      for (let i = 0; i < fetchLimit; i++) {
        const blockNumToFetch = currentBlockNumber - i;
        if (blockNumToFetch >= 0) {
          blockPromises.push( provider.getBlock(blockNumToFetch).catch(err => { console.error(`Failed to fetch block ${blockNumToFetch}:`, err); return null; }) );
        }
      }
      const fetchedBlocks = await Promise.all(blockPromises);
      console.log("Fetched raw blocks:", fetchedBlocks.length);
      const formattedBlocks: BlockData[] = fetchedBlocks
        .filter((block): block is ethers.providers.Block => block !== null)
        .map(block => ({
          id: block.number,
          timestamp: new Date(block.timestamp * 1000),
          transactions: block.transactions?.length ?? 0,
          gasUsed: block.gasUsed ? ethers.BigNumber.from(block.gasUsed).toNumber() : 0,
        }));
      console.log("Formatted blocks:", formattedBlocks.length);
      setBlocks(formattedBlocks);
    } catch (error) {
      console.error("Failed to fetch blockchain data:", error); setBlocks([]); setBlockCount(0);
    } finally {
      setIsLoading(false); console.log("Fetching complete.");
    }
  };


  const handleBlockClick = async (blockId: number) => {
    console.log("Handling click for block:", blockId);
    if (!contract?.provider || !isConnected) { console.log("Block click skipped: Not connected or provider missing."); return; }
    try {
      setIsLoadingBlockDetails(true); setSelectedBlock(null);
      const provider = contract.provider as ethers.providers.Web3Provider;
      const blockDetails = await provider.getBlock(blockId, true).catch(err => { console.error(`Failed to fetch details for block ${blockId}:`, err); return null; });
      setSelectedBlock(blockDetails); console.log("Fetched block details:", blockDetails);
    } catch (error) {
      console.error(`Error in handleBlockClick for block ${blockId}:`, error); setSelectedBlock(null);
    } finally {
      setIsLoadingBlockDetails(false);
    }
  };

  // Configure the dock items
  const dockItems = [
    { icon: <Home size={24} />, label: 'Home', onClick: () => window.location.href = '/' },
    { icon: <Package size={24} />, label: 'Track Medicine', onClick: () => setActiveTab("track") },
    { icon: <Factory size={24} />, label: 'Manufacturer', onClick: () => setActiveTab("manufacturer") },
    { icon: <ShoppingBag size={24} />, label: 'Retailer', onClick: () => setActiveTab("retailer") },
  ];

  // Calculate percentage change for gasUsed safely
  const calculateGasPercentageChange = () => {
    if (!blocks || blocks.length < 2) return 0;
    const latestGas = Number(blocks[0]?.gasUsed) || 0;
    const previousGas = Number(blocks[1]?.gasUsed) || 0;
    if (previousGas === 0) { return latestGas > 0 ? 100 : 0; }
    return Math.round(((latestGas - previousGas) / previousGas) * 100);
  }
  const gasPercentageChange = calculateGasPercentageChange();

  // Prepare chart data safely
   const chartData = blocks.map(block => ({
        id: `#${block.id}`,
        gasUsed: Number(block.gasUsed) || 0, // Ensure number, default 0
    })).reverse(); // Reverse for chronological order (left-to-right)


  return (
    <div className="container mx-auto p-6 pb-24 relative min-h-screen">
      <div className="flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div> <h1 className="text-3xl font-bold">Dashboard</h1> <p className="text-muted-foreground mt-1"> Secure medicine tracking on the blockchain </p> </div>
          <WalletConnect />
        </div>

        {/* Tabs Navigation and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="track" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Main Content Area (Left/Top on smaller screens) */}
              <div className="md:col-span-2 space-y-6">
                <MedicineTracker />
                {/* Waves Visualization Card */}
                <div className="relative w-full h-[180px] rounded-lg overflow-hidden">
                  <Card className="w-full h-full overflow-hidden border border-teal-500/20">
                    <Waves lineColor="hsl(171, 77%, 64%)" backgroundColor="hsl(171, 77%, 4%)" waveSpeedX={0.02} waveSpeedY={0.01} waveAmpX={40} waveAmpY={20} friction={0.9} tension={0.01} maxCursorMove={120} xGap={12} yGap={36} />
                  </Card>
                </div>
                <MedicineList />
              </div>

              {/* Sidebar Area (Right/Bottom on smaller screens) */}
              <div className="space-y-6">
                {/* Latest Blocks Panel */}
                <Card>
                  <CardHeader className="pb-3"> {/* ... Header content ... */}
                     <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Latest Blocks</CardTitle>
                      <Button variant="ghost" size="sm" onClick={fetchBlockchainData} disabled={isLoading || !isConnected} className="h-8 w-8 p-0" aria-label="Refresh blocks">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                        <span className="sr-only">Refresh blocks</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent> {/* ... Conditional rendering for blocks list ... */}
                    {!isConnected ? (
                      <div className="flex flex-col items-center justify-center text-center py-6"> <Info className="h-10 w-10 text-muted-foreground/30 mb-2" /> <p className="text-sm text-muted-foreground"> Connect your wallet to view blockchain data </p> </div>
                    ) : isLoading ? (
                      <div className="flex justify-center items-center py-6"> <p className="text-sm animate-pulse">Loading block data...</p> </div>
                    ) : !blocks || blocks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-6"> <Package className="h-10 w-10 text-muted-foreground/30 mb-2" /> <p className="text-sm text-muted-foreground"> No block data available or failed to load. </p> </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20">
                        {blocks.map(block => (
                          <Dialog key={block.id}>
                            <DialogTrigger asChild>
                              <div className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 cursor-pointer px-2 rounded-md transition-colors duration-150" onClick={() => handleBlockClick(block.id)} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBlockClick(block.id)}>
                                {/* Block Info */}
                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                  <div className="rounded bg-muted p-1.5 flex-shrink-0"><Package size={16} className="text-primary" /></div>
                                  <div className="overflow-hidden"> <div className="font-medium text-sm truncate">Block #{block.id}</div> <div className="text-xs text-muted-foreground truncate">{block.timestamp?.toLocaleTimeString() ?? 'N/A'}</div> </div>
                                </div>
                                {/* Txns & Gas Info */}
                                <div className="text-right flex-shrink-0"> <div className="text-sm">{block.transactions ?? 0} txns</div> <div className="text-xs text-muted-foreground flex items-center justify-end gap-1"> <Fuel size={12} /> {typeof block.gasUsed === 'number' ? block.gasUsed.toLocaleString() : '0'} </div> </div>
                              </div>
                            </DialogTrigger>
                            {/* Block Details Dialog Content */}
                            <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
                              <DialogHeader> <DialogTitle>Block #{selectedBlock?.number ?? block.id ?? '...'} Details</DialogTitle> </DialogHeader>
                              {isLoadingBlockDetails ? (
                                <div className="flex justify-center items-center py-10"><p className="text-sm animate-pulse">Loading block details...</p></div>
                              ) : selectedBlock ? (
                                  <div className="space-y-6 mt-2">
                                    {/* Block Overview Section */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {/* Timestamp */}
                                      <div className="space-y-1"><div className="text-sm font-medium flex items-center gap-1.5"><Clock size={14} className="text-muted-foreground" />Timestamp</div><div className="text-sm">{selectedBlock.timestamp ? new Date(selectedBlock.timestamp * 1000).toLocaleString() : 'N/A'}</div></div>
                                      {/* Miner */}
                                      <div className="space-y-1"><div className="text-sm font-medium flex items-center gap-1.5"><User size={14} className="text-muted-foreground" />Miner</div><div className="text-xs break-all">{selectedBlock.miner ?? 'N/A'}</div></div>
                                      {/* Gas Used / Limit */}
                                      <div className="space-y-1"><div className="text-sm font-medium flex items-center gap-1.5"><Fuel size={14} className="text-muted-foreground" />Gas Used / Limit</div><div className="text-sm">{selectedBlock.gasUsed ? ethers.BigNumber.from(selectedBlock.gasUsed).toNumber().toLocaleString() : '0'} / {selectedBlock.gasLimit ? ethers.BigNumber.from(selectedBlock.gasLimit).toNumber().toLocaleString() : '0'}</div></div>
                                      {/* Hash */}
                                      <div className="space-y-1"><div className="text-sm font-medium flex items-center gap-1.5"><Hash size={14} className="text-muted-foreground" />Hash</div><div className="text-xs break-all">{selectedBlock.hash ?? 'N/A'}</div></div>
                                      {/* Parent Hash */}
                                      <div className="space-y-1 sm:col-span-2"><div className="text-sm font-medium flex items-center gap-1.5"><Hash size={14} className="text-muted-foreground" />Parent Hash</div><div className="text-xs break-all">{selectedBlock.parentHash ?? 'N/A'}</div></div>
                                    </div>
                                    {/* Transactions Section */}
                                    <div>
                                      <h3 className="text-sm font-medium mb-2">Transactions ({selectedBlock.transactions?.length ?? 0})</h3>
                                      {!selectedBlock.transactions || selectedBlock.transactions.length === 0 ? (
                                        <div className="text-sm text-muted-foreground py-2 px-3 border rounded-md">No transactions in this block</div>
                                      ) : (
                                        <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20">
                                          {selectedBlock.transactions.map((tx, index) => (
                                            <div key={typeof tx === 'string' ? tx : tx?.hash ?? index} className="p-2 text-xs hover:bg-muted/50">
                                              <div className="font-medium">Tx #{index + 1}</div><div className="text-muted-foreground break-all mt-1">{typeof tx === 'string' ? tx : tx?.hash ?? 'N/A'}</div>
                                              {typeof tx !== 'string' && tx?.from && tx?.to && (<div className="text-xs mt-1 flex justify-between"><span>From: <span className="font-mono text-muted-foreground/80">{tx.from.substring(0, 6)}...{tx.from.substring(tx.from.length - 4)}</span></span><span>To: <span className="font-mono text-muted-foreground/80">{tx.to?.substring(0, 6)}...{tx.to?.substring(tx.to.length - 4) ?? 'Contract'}</span></span></div>)}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {/* Close Button */}
                                    <DialogClose asChild><Button variant="outline" className="w-full mt-4">Close</Button></DialogClose>
                                  </div>
                                ) : ( <div className="flex justify-center items-center py-10"><p className="text-sm text-muted-foreground">No block details available or failed to load.</p></div> )}
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Block Gas Usage Chart */}
                <Card className="mt-6">
                  <CardHeader className="pb-2"> {/* ... Chart Header ... */}
                     <div className="flex items-center justify-between gap-2">
                      <div className="flex-1"> <CardTitle className="text-lg">Block Gas Usage</CardTitle> <CardDescription>Gas usage trend in recent blocks</CardDescription> </div>
                      {blocks && blocks.length > 1 && isConnected && ( <div className={`flex items-center text-xs font-medium flex-shrink-0 ${gasPercentageChange >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}> {gasPercentageChange >= 0 ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3"/>} {gasPercentageChange}% </div> )}
                    </div>
                  </CardHeader>
                  <CardContent> {/* ... Chart Conditional Rendering ... */}
                     {!isConnected ? (
                        <div className="flex flex-col items-center justify-center text-center py-8 min-h-[180px]"><Info className="h-10 w-10 text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">Connect wallet to view graph</p></div>
                    ) : isLoading ? (
                      <div className="flex justify-center items-center py-8 min-h-[180px]"><p className="text-sm animate-pulse">Loading graph data...</p></div>
                    ) : !blocks || blocks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-8 min-h-[180px]"><Package className="h-10 w-10 text-muted-foreground/30 mb-2" /><p className="text-sm text-muted-foreground">No block data for graph</p></div>
                    ) : (
                      // Remove color config from ChartContainer if setting color directly below
                      <ChartContainer config={{ gasUsed: { label: "Gas Used" } }} className="min-h-[180px] w-full">
                        <LineChart accessibilityLayer data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/50" />
                          <XAxis dataKey="id" tickLine={false} axisLine={false} tickMargin={8} className="text-xs fill-muted-foreground" interval="preserveEnd" minTickGap={25} tick={{ fontSize: 9 }} />
                          <YAxis dataKey="gasUsed" axisLine={false} tickLine={false} tickMargin={8} className="text-xs fill-muted-foreground" allowDecimals={false} domain={[0, 'auto']} width={45} tickFormatter={(value) => (typeof value === 'number' ? value.toLocaleString() : '0')} />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(label) => `Block ${label}`} formatter={(value) => typeof value === 'number' ? value.toLocaleString() : value} />} />
                          {/* ===================== USE SPECIFIC COLOR ===================== */}
                          <Line
                            type="monotone"
                            dataKey="gasUsed"
                            stroke="#60A8FB" // Use the specified hex color for the line
                            strokeWidth={2}
                            dot={{
                              r: 2,
                              fill: "#60A8FB", // Use the specified hex color for the dots
                              strokeWidth: 0,
                            }}
                            activeDot={{
                              r: 4,
                              fill: "#60A8FB", // Use the specified hex color for the active dot
                              strokeWidth: 1,
                              stroke: 'hsl(var(--background))', // Keep background contrast stroke
                            }}
                            isAnimationActive={false}
                          />
                          {/* =================== END SPECIFIC COLOR =================== */}
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-muted-foreground"> {/* ... Chart Footer ... */}
                    Showing gas used across the {blocks?.length ?? 0} most recent blocks (Total: {blockCount?.toLocaleString() ?? '...'})
                  </CardFooter>
                </Card>
              </div> {/* End Sidebar Area */}
            </div> {/* End Grid */}
          </TabsContent>

          {/* Manufacturer Tab Content */}
          <TabsContent value="manufacturer" className="mt-0"> <ManufacturerPanel /> </TabsContent>
          {/* Retailer Tab Content */}
          <TabsContent value="retailer" className="mt-0"> <RetailerPanel /> </TabsContent>
        </Tabs>
      </div> {/* End Main Content Flex Col */}

      {/* MacOS style Dock Navigation */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <Dock items={dockItems} panelHeight={68} baseItemSize={50} magnification={70} className="!rounded-xl !bg-opacity-80 !backdrop-blur-md !bg-zinc-900 dark:!bg-zinc-800 pointer-events-auto" />
      </div>
    </div> // End Container
  )
}

// Main Exported Component
export default function Dashboard() {
  return (
    <Web3Provider> {/* Ensure Web3Provider wraps the content */}
      <DashboardContent />
      <Toaster position="top-center" richColors /> {/* Use richColors for better toast types */}
    </Web3Provider>
  );
}