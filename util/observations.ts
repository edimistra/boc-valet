export function getAVGRate(observations: Array<any>, seriesName: string): number {
    const sumForexRate = observations.reduce((sum, forexRate) => sum + parseFloat(forexRate[seriesName].v), 0);
    const totalObservations = observations.length;
    
    return sumForexRate/totalObservations;
}

export function extractLabel(seriesName: string): string {
    const seriesFrom = seriesName.substring(2, 5);
    const seriesTo = seriesName.substring(5, 8);

    return `${seriesFrom}/${seriesTo}`;
}
