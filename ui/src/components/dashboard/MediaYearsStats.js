import React from 'react';
import { Chart, Series, CommonSeriesSettings, Legend, Export, Tooltip, Title, ArgumentAxis, Label, ValueAxis } from 'devextreme-react/chart'
import { Grid as ChartGrid } from 'devextreme-react/chart'
import { Typography, Grid, Paper } from '@mui/material';

const customizeTooltip = (arg) => {
  return {
    text: `You have ${arg.valueText} ${arg.seriesName === 'Movie' ? 'Movie(s)' : 'Series'} from ${arg.argumentText}`
  };
}
const MediaYearsStats = (props) => {
  const { data, title } = props

  return (
    <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0)'}}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h6">{title}</Typography>
        </Grid>
        <Grid item xs={12} md={12}>
          <Chart
            id="chart"
            dataSource={data}
          >
            <Title
              text="Media Release Years"
              subtitle="The distribution of your media over the years"
            />
            <CommonSeriesSettings argumentField="year" type="stackedBar" />
            <Series valueField="series" name="Series" />
            <Series valueField="movie" name="Movie" />
            <ValueAxis>
              <Title text="Number of Media" />
            </ValueAxis>
            <ArgumentAxis tickInterval={10}>
              <Title text="Release Year"/>
              <Label customizeText={(e) => e.value}/>
            </ArgumentAxis>
            <Legend verticalAlignment="top"
              horizontalAlignment="center"
              itemTextPosition="right"
            />
            <Export enabled={false} />
            <Tooltip
              enabled={true}
              customizeTooltip={customizeTooltip}
            />
          </Chart>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default MediaYearsStats