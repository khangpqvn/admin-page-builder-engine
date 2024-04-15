import React, { Component } from 'react';
import _ from 'lodash'
import {
    Input,
    InputGroupAddon,
    InputGroup,
    Button
} from 'reactstrap';

import { GoogleMap, Marker, withScriptjs, withGoogleMap, } from "react-google-maps"
const { SearchBox } = require("react-google-maps/lib/components/places/SearchBox");

const MapWithAMarker = withScriptjs(withGoogleMap(props =>
    <GoogleMap
        ref={ref => { this.map = ref }}
        defaultZoom={16}
        center={{ lat: props.lat, lng: props.lng }}
        onBoundsChanged={() => {
            this.bounds = this.map.getBounds();
            this.center = this.map.getCenter();
            // console.log({onBoundsChanged:this.bounds,center:this.center})
            // if (props.onChange) {
            //     let rs = `${this.center.lat()}/${this.center.lng()}`
            //     props.onChange(rs);
            // }
        }}
        onClick={v => {
            //    let position= {lat:v.latLng.lat(),lng:v.latLng.lng()}
            if (props.onChange) {
                let rs = `${v.latLng.lat()}/${v.latLng.lng()}`
                props.onChange(rs);
            }
        }}
    >
        <Marker
            ref={ref => { this.marker = ref }}
            position={{ lat: props.lat, lng: props.lng }}
            draggable={true}
            animation={"DROP"}
            onDragEnd={evt => {
                if (props.onChange) {
                    let rs = `${evt.latLng.lat()}/${evt.latLng.lng()}`
                    props.onChange(rs);
                }
            }}
        />
        <SearchBox
            ref={ref => { this.searchBox = ref }}
            bounds={props.bounds}
            controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
            onPlacesChanged={() => {
                const places = this.searchBox.getPlaces();
                const bounds = new window.google.maps.LatLngBounds();

                places.forEach(place => {
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport)
                    } else {
                        bounds.extend(place.geometry.location)
                    }
                });
                const nextMarkers = places.map(place => ({
                    position: place.geometry.location,
                }));
                const nextCenter = _.get(nextMarkers, '0.position', { lat: props.lat, lng: props.lng });
                if (props.onChange) {
                    let rs = `${nextCenter.lat()}/${nextCenter.lng()}`
                    props.onChange(rs);
                }
                // console.log({ nextCenter, lat: nextCenter.lat(), lng: nextCenter.lng() })
                // this.marker.position={lat: nextCenter.lat(), lng: nextCenter.lng()}
                // this.setState({
                //     center: nextCenter,
                //     markers: nextMarkers,
                // });
            }}
        >
            <input
                type="text"
                placeholder="Tìm kiếm địa chỉ"
                style={{
                    boxSizing: `border-box`,
                    border: `1px solid transparent`,
                    width: `500px`,
                    height: `32px`,
                    marginTop: `8px`,
                    padding: `0 12px`,
                    borderRadius: `3px`,
                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                    fontSize: `14px`,
                    outline: `none`,
                    textOverflow: `ellipses`,
                }}
            />
        </SearchBox>
    </GoogleMap>
));
class Location extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        }
    }
    render() {
        let rs = [21.03098074908786, 105.78287734051014];
        if (this.props.value) {
            rs = this.props.value.split('/');
            if (!isNaN(Number(rs[0])) && !isNaN(Number(rs[1]))) {
                rs[0] = Number(rs[0]);
                rs[1] = Number(rs[1]);
            }
        }
        return (<div>
            <InputGroup>
                <Input type="text" id="name" placeholder={this.props.placeholder || ''} required value={this.props.value || ''} disabled={this.props.disabled}
                    onChange={evt => {
                        if (this.props.onChange) {
                            this.props.onChange(evt.target.value);
                        }
                    }} />
                {/* <InputGroupAddon addonType="append">
                    <Button type="button" color="default">Nhập vị trí</Button>
                </InputGroupAddon> */}
            </InputGroup>

            <div style={{ marginTop: '15px' }}>
                <MapWithAMarker
                    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBoV6apMMKQdcDyFhg3L4XZAHCB3eCATg4&v=3.exp&libraries=geometry,drawing,places"
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `400px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                    lat={rs[0]}
                    lng={rs[1]}
                    onChange={val => {
                        if (this.props.onChange) {
                            this.props.onChange(val);
                        }
                    }}
                />
            </div>
        </div>)
    }
}

export default Location;
