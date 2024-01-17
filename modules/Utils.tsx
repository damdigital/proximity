export const mkGUID = () => generateUUID()

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export const formatString = (str: string, ...args: [any]) => {
    return str.replace(/{(\d+)}/g, (match, number) => typeof args[number] != 'undefined' ? args[number] : match);
}

export const isValidDate = (dt: Date): boolean => {
    return Object.prototype.toString.call(dt) === "[object Date]" && !isNaN(dt.getTime())
}

export const haveSameDatePart = (date1: Date, date2: Date) =>
    isValidDate(date1)
    && isValidDate(date2)
    && date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate()

export const deepEqual = (obj1, obj2) => {
    // Check for null values
    if (obj1 === null || obj2 === null) {
        return obj1 === obj2;
    }

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

export const parseTime = (timeStr: string): Date => {
    var d = new Date();
    var time = timeStr.match(/([0-9]{2}):([0-9]{2}):([0-9]{2})/);
    if (time && time.length === 4) {
        d.setHours(parseInt(time[1]));
        d.setMinutes(parseInt(time[2]));
        d.setSeconds(parseInt(time[3]));
    }
    return d;
}