import { RegionMessageResponse, ProximityData, ServerResponse } from './serverTypes';

export const fetchProximityData = async (): Promise<ServerResponse<ProximityData>> => {
    let res: ServerResponse<ProximityData> = {
        data: null,
        error: null,
        status: 500,
        success: false
    }
    try {
        const response = await fetch("https://prep-www.mcarthurglen.com/api/v1/centre/proximityData", {
            credentials: 'omit',
            headers: {
                'Cookie': 'Mcg:Club:Auth=ILW2SZjv5VlOzZKzCSOvxEzPtKsUih6+STrnDXyk/m8iR4usmG6iPzqeUrdNvsZ1zQa43wiMq9PztMcXXjvtO9Nm+9TDeUE8PQzZcQ5wZuxlFhJnnnLIqKZxpQLBUkMYqLgpBH5mGCzoEIhCk0f0Zigx0cPFOGAwl6NWwwAWGlPvyaT+mF23xXFIyq5o0LfE/ORssOcpo1yxhbB/cGifJBg0xueoeR0K5bHJ7jyrFCzOoEA/1hKkh4tknI9zlt1mFF9lG0QUUZTh5dUmEnHqWJXGL/na/RzxljNZ+W9n9cUc4PFpO6BvZLIXrxigmLK1'
            }
        })
        const result = await response.json() as ProximityData;
        console.debug("Success", result)
        res.data = result
        res.status = 200
        res.success = true
    } catch (e) {
        console.error("Error", e);
        res.error = e
    }
    return res
}

export const fetchRegionMessage = async (centreId: any, timeout: number | null = null): Promise<ServerResponse<RegionMessageResponse>> => {
    return /*await _fetch<RegionMessageResponse>(`/api/v1/centre/regionMessage?centreId=${centreId}`,
        { timeout })*/
}
