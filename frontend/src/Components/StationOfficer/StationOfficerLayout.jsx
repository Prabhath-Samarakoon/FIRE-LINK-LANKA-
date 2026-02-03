import React from 'react';
import { Outlet } from 'react-router-dom';

const StationOfficerLayout = () => {
    return (
        <div className="station-officer-layout">
            <Outlet />
        </div>
    );
};

export default StationOfficerLayout;
