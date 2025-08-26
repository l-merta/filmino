interface DateFormatProps {
  first_air_date: string;
  last_air_date: string;
  in_production: boolean;
}

export default function DateFormat({ first_air_date, last_air_date, in_production }: DateFormatProps) {
  let airDate;

  if (in_production)
    airDate = first_air_date.split('-')[0] + ' - ' || '';
  else if (first_air_date && last_air_date && first_air_date.split('-')[0] == last_air_date.split('-')[0])
    airDate = first_air_date.split('-')[0] || '';
  else
    airDate = first_air_date.split('-')[0] + ' - ' + last_air_date.split('-')[0] || '';

  return (
    <>{airDate}</>
  )
}