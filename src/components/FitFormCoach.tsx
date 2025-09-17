import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Play, Square, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SquatAnalysis {
  repCount: number;
  isInSquat: boolean;
  formFeedback: string;
  formScore: 'good' | 'warning' | 'error';
}

const FitFormCoach = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [analysis, setAnalysis] = useState<SquatAnalysis>({
    repCount: 0,
    isInSquat: false,
    formFeedback: "Stand in front of camera to begin",
    formScore: 'good'
  });

  const motivationalMessages = [
    "Perfect form! 💪",
    "You're crushing it! 🔥", 
    "Fantastic depth! 🎯",
    "Keep that energy! ⚡",
    "Strong and steady! 🏆",
    "Great rep! 🌟"
  ];

  const formTips = [
    "Go a little lower! 📏",
    "Keep that chest up! 💪", 
    "Slow and controlled! ⏱️",
    "Focus on form! 🎯",
    "Deeper squat! 📐"
  ];

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCamera(false);
    }
  }, []);

  const startWorkout = useCallback(() => {
    setIsWorkoutActive(true);
    setAnalysis(prev => ({
      ...prev,
      formFeedback: "Ready to squat! Let's go! 🚀",
      formScore: 'good'
    }));
  }, []);

  const stopWorkout = useCallback(() => {
    setIsWorkoutActive(false);
    setAnalysis(prev => ({
      ...prev,
      formFeedback: `Great workout! You completed ${prev.repCount} squats! 🎉`,
      formScore: 'good'
    }));
  }, []);

  const resetWorkout = useCallback(() => {
    setAnalysis({
      repCount: 0,
      isInSquat: false,
      formFeedback: "Ready for a fresh start! 💪",
      formScore: 'good'
    });
  }, []);

  // Simulate squat detection (in real app this would use pose detection)
  useEffect(() => {
    if (!isWorkoutActive) return;

    const interval = setInterval(() => {
      // Simulate random squat detection
      const shouldDetectSquat = Math.random() > 0.7;
      
      if (shouldDetectSquat) {
        setAnalysis(prev => {
          const newRepCount = prev.repCount + 1;
          const formScores: Array<'good' | 'warning'> = ['good', 'good', 'good', 'warning'];
          const formScore = formScores[Math.floor(Math.random() * formScores.length)];
          
          let feedback;
          if (formScore === 'good') {
            feedback = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
          } else {
            feedback = formTips[Math.floor(Math.random() * formTips.length)];
          }

          return {
            repCount: newRepCount,
            isInSquat: true,
            formFeedback: feedback,
            formScore
          };
        });

        // Reset isInSquat after a moment
        setTimeout(() => {
          setAnalysis(prev => ({ ...prev, isInSquat: false }));
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isWorkoutActive, motivationalMessages, formTips]);

  useEffect(() => {
    initCamera();
  }, [initCamera]);

  const getFeedbackStyle = () => {
    switch (analysis.formScore) {
      case 'good':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-fitness-gradient bg-clip-text text-transparent">
            FitForm Coach
          </h1>
          <p className="text-muted-foreground">Perfect your squats with AI</p>
        </div>

        {/* Camera View */}
        <Card className="relative overflow-hidden bg-card border-2 border-border">
          <div className="relative aspect-[3/4] bg-muted">
            {hasCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
                
                {/* Pose Detection Overlay */}
                {isWorkoutActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-primary/50 rounded-lg" />
                    {analysis.isInSquat && (
                      <div className="absolute inset-4 border-2 border-success rounded-lg animate-pulse shadow-success-glow" />
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center space-y-4">
                <div>
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Camera access needed</p>
                  <Button onClick={initCamera} variant="outline" className="mt-2">
                    Enable Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Stats & Feedback */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{analysis.repCount}</div>
              <div className="text-sm text-muted-foreground">Reps</div>
            </div>
            <Badge 
              variant={analysis.formScore === 'good' ? 'default' : 'outline'}
              className={cn(
                "text-sm px-3 py-1",
                analysis.formScore === 'good' && "bg-success text-success-foreground",
                analysis.formScore === 'warning' && "bg-warning text-warning-foreground border-warning"
              )}
            >
              {analysis.formScore === 'good' ? 'Great Form!' : 'Check Form'}
            </Badge>
          </div>

          <Card className="p-4 bg-card/50 backdrop-blur-sm border border-border/50">
            <p className={cn("text-center font-medium text-lg", getFeedbackStyle())}>
              {analysis.formFeedback}
            </p>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isWorkoutActive ? (
            <Button 
              onClick={startWorkout} 
              disabled={!hasCamera}
              className="flex-1 bg-fitness-gradient hover:opacity-90 transition-opacity"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
          ) : (
            <Button 
              onClick={stopWorkout}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Workout
            </Button>
          )}
          
          <Button 
            onClick={resetWorkout}
            variant="outline"
            size="lg"
            className="px-4"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Tips */}
        <Card className="p-4 bg-card/30 border-border/50">
          <h3 className="font-semibold mb-2 text-primary">Quick Tips:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Stand with feet shoulder-width apart</li>
            <li>• Keep your chest up and core engaged</li>
            <li>• Lower until thighs are parallel to ground</li>
            <li>• Push through your heels to stand up</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default FitFormCoach;