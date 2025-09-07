import Company from "@/components/Company";

import { Skeleton } from "@/components/ui/skeleton";

import { CompanyDetails } from "@/types/tmdbApi";

interface CompaniesListProps {
  companies?: CompanyDetails[];
}

export default function CompaniesList({ companies }: CompaniesListProps) {
  return (
    <div className="flex flex-wrap items-center gap-8 z-5">
      {companies ? 
        (companies.map((company) => (
          <Company key={company.id} data={company} />
        )))
      :
        (Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={'company-skeleton-' + index} className="w-38 h-20" />
        )))
      }
    </div>
  )
}