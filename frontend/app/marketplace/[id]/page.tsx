import { Metadata } from 'next'
import MarketDetailsClient from './MarketDetailsClient'

export const generateStaticParams = async () => {
  // Generate static params for all market IDs (1-5 based on CSV data)
  return Array.from({ length: 5 }, (_, i) => ({
    id: (i + 1).toString()
  }))
}

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
  return {
    title: `Market Details - Market ${params.id}`,
    description: 'View details about this farmers market, including available products, meal planning, and smart bundles.'
  }
}

export default function MarketDetailsPage({ params }: { params: { id: string } }) {
  return <MarketDetailsClient id={params.id} />
} 