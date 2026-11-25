import React from "react";

function PostCalendarShare({ calendarShare }) {
    if (!calendarShare) return null;

    // Beräkna första veckodagen för månaden
    const firstDateObj = calendarShare?.days?.[0] ? new Date(calendarShare.days[0].date) : new Date();
    const firstDayIndex = firstDateObj.getDay();
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    return (
        <div className="mt-3 mb-2 min-w-0 overflow-hidden bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 sm:p-4 text-gray-800 shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-3 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 truncate">
                    Training Calendar — {calendarShare.month}
                </h4>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center text-[10px] font-bold text-zinc-400 uppercase">
                <span className="min-w-0 truncate">Mon</span>
                <span className="min-w-0 truncate">Tue</span>
                <span className="min-w-0 truncate">Wed</span>
                <span className="min-w-0 truncate">Thu</span>
                <span className="min-w-0 truncate">Fri</span>
                <span className="min-w-0 truncate">Sat</span>
                <span className="min-w-0 truncate">Sun</span>
            </div>

            {/* Rutnät för månadens dagar med utfyllnadsrutor */}
            <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: adjustedFirstDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square min-w-0 bg-transparent border border-transparent"></div>
                ))}

                {calendarShare.days.map((day, idx) => {
                    let boxStyles = "bg-white border-zinc-200 text-zinc-700";
                    
                    if (day.hasWorkout) {
                        boxStyles = day.completed
                            ? "bg-black border-black text-white font-bold shadow-xs"
                            : "bg-zinc-200 border-zinc-300 text-zinc-800 shadow-xs";
                    } else {
                        boxStyles = "bg-white/50 border-zinc-100 text-zinc-400";
                    }

                    return (
                        <div 
                            key={idx}
                            className={`aspect-square min-w-0 overflow-hidden p-1 rounded-lg border flex flex-col justify-between text-[9px] ${boxStyles}`}
                        >
                            <div className="flex justify-between items-center w-full min-w-0 gap-0.5">
                                <span className={`font-bold truncate ${day.completed ? "text-white" : "text-zinc-900"}`}>
                                    {day.dayNumber}
                                </span>
                                {day.completed && <span className="text-[8px] text-zinc-300 shrink-0">✓</span>}
                            </div>
                            {day.title ? (
                                <span className={`truncate block w-full text-[7px] leading-tight ${day.completed ? "text-zinc-300" : "text-zinc-600"}`} title={day.title}>
                                    {day.title}
                                </span>
                            ) : (
                                <span></span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PostCalendarShare;