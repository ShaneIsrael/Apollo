import React from 'react';
import { useParams } from 'react-router-dom';
import { SeriesService } from '../services';

const Series = () => {
  const { uuid } = useParams()
  const [series, setSeries] = React.useState({})

  React.useEffect(() => {
    async function fetch() {
      const resp = (await SeriesService.getByUuid(uuid)).data
      console.log(resp)
      setSeries(resp)
    }
    fetch()
  }, [uuid])

  return (
    <div>
      {JSON.stringify(series)}    
    </div>
  )
}

export default Series