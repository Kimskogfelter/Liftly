import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { LuDumbbell } from "react-icons/lu";
import api from "../api/axios";
import WorkoutCard from "../components/workouts/WorkoutCard";

function SingleWorkoutPage({ currentUser }) {
    const { workoutId } = useParams(); // get workout ID from URL parameters
    const [workout, setWorkout] = useState(null); // Workout is an object -> null as initial state
    const [liveExercises, setLiveExercises] = useState([]);
    const [error, setError] = useState("");
    const [isFinishing, setIsFinishing] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const token = currentUser?.token;

    // Function to fetch workout details from backend
    const getWorkout = async () => {
        try {
            const response = await api.get(`/workouts/${workoutId}`);
            const fetchedWorkout = response.data.workout || response.data;
            setWorkout(fetchedWorkout);
            setLiveExercises(fetchedWorkout?.exercises || []);
        } catch (err) {
            setError("Could not fetch workout details.");
        }
    };

    // Call getWorkout when component loads or when workoutId/token changes
    useEffect(() => {
        if (token && workoutId) {
            getWorkout();
        }
    }, [workoutId, token]);

    // Räkna ut total vikt (kgs * reps) på slutförda set
    const completedVolume = liveExercises.reduce((total, exercise) => {
        const exerciseVolume = (exercise.sets || []).reduce((sum, set) => {
            if (!set.completed) return sum;
            const kgs = Number(set.kgs) || 0;
            const reps = Number(set.reps) || 0;
            return sum + kgs * reps;
        }, 0);
        return total + exerciseVolume;
    }, 0);

    const allSets = liveExercises.flatMap((exercise) => exercise.sets || []);
    const completedSetsCount = allSets.filter((set) => Boolean(set.completed)).length;

    // Function to finish workout and update calendar
    const handleFinishWorkout = async () => {
        setError("");
        setIsFinishing(true);
        try {
            const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

            // Call backend endpoint
            await api.post("/workouts/finish", {
                workoutId,
                date: todayStr
            });

            setShowSummaryModal(true);
        } catch (err) {
            console.error("Error finishing workout:", err);
            setError("Could not save finished workout.");
        } finally {
            setIsFinishing(false);
        }
    };

    return (
        <section className="flex-1 px-2 md:px-6 max-w-2xl mx-auto pt-16 md:pt-24 xl:pt-8 pb-24 font-sans text-gray-800">
            {error && (
                <div className="w-full bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl mb-6 text-xs font-medium">
                    {error}
                </div>
            )}

            {/* if workout exists execute below code */}
            {workout && (
                <div className="mt-4 flex flex-col items-center">
                    {/* Centrerat sidhuvud som på Training & Health */}
                    <div className="w-full max-w-lg text-center pb-5 mb-6 border-b border-gray-100">
                        <div className="inline-flex items-center justify-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                                <LuDumbbell size={16} />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                                {workout.title}
                            </h1>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5">
                            {liveExercises.length} {liveExercises.length === 1 ? "exercise" : "exercises"} · Check off each set as you go
                        </p>
                    </div>

                    <div className="w-full max-w-lg">
                        <WorkoutCard
                            workout={workout}
                            currentUser={currentUser}
                            onExercisesChange={setLiveExercises}
                        />

                        <button
                            type="button"
                            onClick={handleFinishWorkout}
                            disabled={isFinishing}
                            className="w-full mt-6 bg-black text-white py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isFinishing ? "Finishing..." : "Finish Workout"}
                        </button>
                    </div>
                </div>
            )}

            {showSummaryModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setShowSummaryModal(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-xl p-5 sm:p-6 shadow-xl border border-zinc-100 text-left animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md mb-1.5">
                                    Session Saved
                                </span>
                                <h3 className="text-base font-bold text-zinc-900 leading-tight">
                                    Workout Completed
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {workout?.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSummaryModal(false)}
                                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
                                title="Close"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 mb-3">
                            <p className="text-[11px] font-semibold text-zinc-500">
                                Total weight lifted
                            </p>
                            <div className="flex items-baseline gap-1.5 mt-1">
                                <span className="text-3xl font-bold text-zinc-900 tracking-tight">
                                    {completedVolume.toLocaleString()}
                                </span>
                                <span className="text-xs font-semibold text-zinc-500">kg</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 mb-5">
                            <div className="bg-zinc-50/70 border border-zinc-200/60 rounded-xl px-3.5 py-2.5">
                                <p className="text-[10px] font-semibold text-zinc-400">Exercises</p>
                                <p className="text-sm font-bold text-zinc-800 mt-0.5">
                                    {liveExercises.length}
                                </p>
                            </div>
                            <div className="bg-zinc-50/70 border border-zinc-200/60 rounded-xl px-3.5 py-2.5">
                                <p className="text-[10px] font-semibold text-zinc-400">Completed sets</p>
                                <p className="text-sm font-bold text-zinc-800 mt-0.5">
                                    {completedSetsCount}/{allSets.length}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowSummaryModal(false)}
                            className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl transition-colors cursor-pointer text-xs"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

export default SingleWorkoutPage;