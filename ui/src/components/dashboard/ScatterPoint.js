import React from 'react';
import {
  Chart,
  Series,
  CommonSeriesSettings,
  Legend,
  ValueAxis,
  ArgumentAxis,
  MinorGrid,
  CommonPaneSettings,
  Label,
  Border,
  Tooltip,
} from 'devextreme-react/chart'
import { Grid as ChartGrid } from 'devextreme-react/chart'
import { Typography, Grid, Paper } from '@material-ui/core';

const ScatterPoint = (props) => {
  const { data, name, name2, title, valueInterval, argumentInterval } = props
  return (
    <Paper sx={{p: 2, backgroundColor: 'rgba(0, 0, 0, 0)'}}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h6">{title}</Typography>
        </Grid>
        <Grid item xs={12} md={12}>
          <Chart id={`chart-${title}`} dataSource={data}>
            <CommonSeriesSettings type="scatter" />
            <Series
              name={name}
              valueField="y1"
              argumentField="x1" />
            { name2 && 
              <Series 
                name={name2}
                valueField="y2"
                argumentField="x2"
              />
            }
            <ArgumentAxis 
              title="Release Year"
              tickInterval={argumentInterval}
            >
              <ChartGrid visible={true} />
              <MinorGrid visible={true} />
              <Label customizeText={(e) => e.value}/>
            </ArgumentAxis>
            <ValueAxis title="Number of Media" tickInterval={valueInterval}>
            </ValueAxis>
            <Legend visible={true} />
            <Tooltip
              enabled={true}
              shared={true}
              // customizeTooltip={customizeTooltip}
            />
            <CommonPaneSettings>
              <Border visible={true} />
            </CommonPaneSettings>
          </Chart>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default ScatterPoint