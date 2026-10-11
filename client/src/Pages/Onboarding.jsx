import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profile.service";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { toast } from "../components/ui/Toast";
import StepSkills from "../components/onboarding/StepSkills";
import StepAbout from "../components/onboarding/StepAbout";
import StepLinks from "../components/onboarding/StepLinks";
import StepDone from "../components/onboarding/StepDone";
import { EASE_OUT, DURATION } from "../lib/motion";

const MotionDiv = motion.div;
const STEP_LABELS = ["Skills", "About you", "Links"];

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [checkingExisting, setCheckingExisting] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [skills, setSkills] = useState([]);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [bioError, setBioError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();

  const isMentor = user?.role === "mentor";

  // Stale-localStorage guard: if the server already has this profile marked
  // complete (e.g. an older session, or a just-run backfill), skip the form.
  useEffect(() => {
    let cancelled = false;
    profileService
      .getProfile()
      .then((freshUser) => {
        if (cancelled) return;
        if (freshUser.profileCompleted) {
          setUser((prev) => ({ ...prev, ...freshUser }));
          navigate("/feed");
        } else {
          setCheckingExisting(false);
        }
      })
      .catch(() => setCheckingExisting(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = () => {
    if (currentStep === 0) {
      if (skills.length === 0) {
        setSkillsError(
          isMentor ? "Add at least one area of expertise." : "Add at least one skill you want to learn."
        );
        return;
      }
      setSkillsError("");
    }
    if (currentStep === 1) {
      if (!bio.trim()) {
        setBioError("Add a short bio.");
        return;
      }
      setBioError("");
    }
    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  const handleFinishProfile = async () => {
    setSubmitting(true);
    try {
      const updatedUser = await profileService.completeOnboarding({
        skills,
        bio,
        experience,
        socialLinks: { github, linkedin },
      });
      setUser((prev) => ({ ...prev, ...updatedUser }));
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save your profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingExisting) {
    return <div className="min-h-screen bg-bg" />;
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <h1 className="text-h2 font-display font-bold text-text mb-1 text-center">
          Welcome{user?.username ? `, ${user.username}` : ""}!
        </h1>

        {!done && (
          <div className="mb-2 mt-6">
            <div className="flex justify-between text-caption text-text-subtle mb-1.5">
              <span>
                Step {currentStep + 1} of {STEP_LABELS.length}: {STEP_LABELS[currentStep]}
              </span>
            </div>
            <ProgressBar value={currentStep + 1} max={STEP_LABELS.length} label="Onboarding progress" />
          </div>
        )}

        <Card raised className="p-8 mt-6">
          <AnimatePresence mode="wait">
            <MotionDiv
              key={done ? "done" : currentStep}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -16 }}
              transition={{ duration: DURATION.default, ease: EASE_OUT }}
            >
              {done ? (
                <StepDone onFinish={() => navigate("/feed")} />
              ) : (
                <>
                  {currentStep === 0 && (
                    <StepSkills isMentor={isMentor} skills={skills} onChange={setSkills} error={skillsError} />
                  )}
                  {currentStep === 1 && (
                    <StepAbout
                      isMentor={isMentor}
                      bio={bio}
                      onBioChange={setBio}
                      experience={experience}
                      onExperienceChange={setExperience}
                      bioError={bioError}
                    />
                  )}
                  {currentStep === 2 && (
                    <StepLinks
                      github={github}
                      onGithubChange={setGithub}
                      linkedin={linkedin}
                      onLinkedinChange={setLinkedin}
                    />
                  )}
                </>
              )}
            </MotionDiv>
          </AnimatePresence>

          {!done && (
            <div className="flex justify-between mt-8">
              <Button variant="ghost" onClick={goBack} disabled={currentStep === 0}>
                Back
              </Button>
              {currentStep < 2 ? (
                <Button variant="primary" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" onClick={handleFinishProfile} loading={submitting}>
                  Finish setting up my profile
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
