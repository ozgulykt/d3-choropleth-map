import React, { Component } from 'react';
import drawChart from './DrawChart';
import axios from 'axios';

const EDUCATION_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

class Map extends Component {
    async componentDidMount() {
        const raw_education_data = await axios.get(EDUCATION_FILE);
        const education_data = raw_education_data.data;
    
        const raw_county_data = await axios.get(COUNTY_FILE);
    
        const county_data = raw_county_data.data;
    
        drawChart(education_data, county_data, this.props);
      }
    render() {
        return (
            <div className="map">
            </div>
        )
    }
}

export default Map;