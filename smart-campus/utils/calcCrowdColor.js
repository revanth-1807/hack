const calculateCrowdColor = (currentCount, maxCapacity) => {
    const percentage = (currentCount / maxCapacity) * 100;
    
    if (percentage < 33) {
        return 'white'; // Low crowd
    } else if (percentage >= 33 && percentage < 66) {
        return 'orange'; // Medium crowd
    } else {
        return 'red'; // High crowd
    }
};

const getCrowdStatus = (color) => {
    switch (color) {
        case 'white':
            return { status: 'Low Crowd', message: 'Plenty of space available' };
        case 'orange':
            return { status: 'Medium Crowd', message: 'Moderate waiting time' };
        case 'red':
            return { status: 'High Crowd', message: 'Long waiting time expected' };
        default:
            return { status: 'Unknown', message: 'Status unavailable' };
    }
};

module.exports = {
    calculateCrowdColor,
    getCrowdStatus
};
