import { useState } from "react";
import { useRef } from "react";
import { Map, MapMarker, MarkerContent, MarkerPopup, type MapRef } from "@/components/ui/map";
import samples from "@/data/demo";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeftIcon, ArrowRightIcon, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { haversine } from "@/lib/haversine";

type LngLat = { lng: number; lat: number; };
type GameState = "GUESSING" | "SUBMITTED";

const DEFAULT_MARKER: LngLat = { lng:-34.3421, lat: 45.3308 };

export function MapGuessingGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [gameState, setGameState] = useState<GameState>("GUESSING");
    const [draggableMarker, setDraggableMarker] = useState<LngLat>(DEFAULT_MARKER);
    const [userDistanceError, setUserDistanceError] = useState<number | null>(null);

    const mapRef = useRef<MapRef>(null);
    const sample = samples[currentIndex];
    const submitted = gameState === "SUBMITTED";

    const groundTruthCoords: LngLat = {
        lng: sample.groundTruthLng,
        lat: sample.groundTruthLat
    }

    const clipCoords: LngLat = {
        lng: sample.clipPredLng,
        lat: sample.clipPredLat
    }
    
    const clipError = sample.error_km;
    const closest = userDistanceError !== null ? userDistanceError <= clipError ? "You" : "Fine-Tuned CLIP" : "";

    const refreshState = (index: number) => {
        setCurrentIndex(index);
        setGameState("GUESSING");
        setDraggableMarker(DEFAULT_MARKER);
        centerMap(DEFAULT_MARKER);
    };

    const centerMap = (coords: LngLat, zoom: number = 0) => {
        mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: zoom });
    };

    const handleNext = () => {
        refreshState((currentIndex + 1) % samples.length);
    };

    const handlePrev = () => {
        refreshState((currentIndex - 1 + samples.length) % samples.length);
    };

    const handleSubmit = () => {
        const distanceError = haversine(
            draggableMarker.lat,
            draggableMarker.lng,
            groundTruthCoords.lat,
            groundTruthCoords.lng
        );

        setUserDistanceError(distanceError);
        setGameState("SUBMITTED");
        centerMap(groundTruthCoords, 8);
    };

    return (
        <div className="w-full max-w-7xl grid grid-cols-2 gap-x-16 gap-y-6 items-center">

            {/* Image */}
            <div className="h-96 overflow-hidden rounded-xl">
                <img src={sample.path} className="w-full h-full object-cover" />
            </div>

            {/* Map */}
            <Card className="h-96 overflow-hidden rounded-xl p-0 border-0">
                <Map ref={mapRef} center={[DEFAULT_MARKER.lng, DEFAULT_MARKER.lat]} zoom={0}>
                    <MapMarker
                        draggable={!submitted}
                        longitude={draggableMarker.lng}
                        latitude={draggableMarker.lat}
                        onDragEnd={(lngLat) => {
                            setDraggableMarker({ lng: lngLat.lng, lat: lngLat.lat });
                        }}
                    >
                        <MarkerContent>
                            <div className={submitted ? "cursor-default" : "cursor-move"}>
                                <MapPin className="fill-white stroke-white" size={28} />
                            </div>
                        </MarkerContent>

                        <MarkerPopup>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                    {"Your Guess"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {draggableMarker.lat.toFixed(4)},
                                    {" "}
                                    {draggableMarker.lng.toFixed(4)}
                                </p>
                            </div>
                        </MarkerPopup>
                    </MapMarker>

                    {submitted && (
                        <>
                            <MapMarker
                                longitude={groundTruthCoords.lng}
                                latitude={groundTruthCoords.lat}
                            >   
                                <MarkerContent>
                                    <div>
                                        <MapPin className="fill-green-500 stroke-green-500" size={28}/>
                                    </div>
                                </MarkerContent>

                                <MarkerPopup>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">
                                        Actual
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {groundTruthCoords.lat.toFixed(4)},
                                        {" "}
                                        {groundTruthCoords.lng.toFixed(4)}
                                    </p>
                                </div>
                            </MarkerPopup>
                            </MapMarker>

                            <MapMarker
                                longitude={clipCoords.lng}
                                latitude={clipCoords.lat}
                            >   
                                <MarkerContent>
                                    <div>
                                        <MapPin className="fill-yellow-300 stroke-yellow-300" size={28}/>
                                    </div>
                                </MarkerContent>

                                <MarkerPopup>
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">
                                        Fine-Tuned CLIP
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {clipCoords.lng.toFixed(4)},
                                        {" "}
                                        {clipCoords.lat.toFixed(4)}
                                    </p>
                                </div>
                            </MarkerPopup>
                            </MapMarker>
                        </>
                    )}
                </Map>
            </Card>

            {/* Placeholder for Grid Alignment */}
            <div />

            {/* Submit Guess */}
            <div className="flex justify-end">
                <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleSubmit}
                    disabled={submitted}
                >
                    Submit Guess
                </Button>
            </div>

            {/* Previous Button */}
            <div className="flex justify-start">
                <Button variant="outline" onClick={handlePrev}>
                    <ArrowLeftIcon />
                    Previous
                </Button>
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
                <Button variant="outline" onClick={handleNext}>
                    Next
                    <ArrowRightIcon />
                </Button>
            </div> 


            {/* Submission Metrics */}
            {submitted && userDistanceError && (
                <div className="col-span-2">
                    <Card className="mx-auto w-full p-4">  
                        <p className="text-sm text-muted-foreground">
                            📍{sample.city}, {sample.region}, {sample.country}
                        </p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Actual (lon, lat)</TableHead>
                                    <TableHead className="text-center">Your Guess (lon, lat)</TableHead>
                                    <TableHead className="text-center">Fine-Tuned CLIP (lon, lat)</TableHead>
                                    <TableHead className="text-center">Your Error (km)</TableHead>
                                    <TableHead className="text-center">Fine-Tuned CLIP Error (km)</TableHead>
                                    <TableHead className="text-center">Closest Guess</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="text-center">{groundTruthCoords.lng.toFixed(2)}, {groundTruthCoords.lat.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{draggableMarker.lng.toFixed(2)}, {draggableMarker.lat.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{clipCoords.lng.toFixed(2)}, {clipCoords.lat.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{userDistanceError.toFixed(2)} km</TableCell>
                                    <TableCell className="text-center">{clipError.toFixed(2)} km</TableCell>
                                    <TableCell className="text-center">{closest}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            )}           
        </div>
    );
}