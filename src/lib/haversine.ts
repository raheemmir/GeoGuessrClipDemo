export function haversine(lat1Deg: number, lon1Deg: number, lat2Deg: number, lon2Deg: number) {
    const lat1 = lat1Deg * Math.PI / 180;
    const lon1 = lon1Deg * Math.PI / 180;
    const lat2 = lat2Deg * Math.PI / 180;
    const lon2 = lon2Deg * Math.PI / 180;

    const R = 6371;
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(lat1) * Math.cos(lat2)
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
}