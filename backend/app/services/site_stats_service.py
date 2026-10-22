from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.job import JobStatus, ProcessingJob
from app.models.lecture import Lecture, LectureStatus
from app.models.media_asset import MediaAsset
from app.models.note import Note
from app.models.quiz import QuizAttempt
from app.models.user import RoleEnum, User


def public_stats(db: Session) -> dict:
    """Aggregate numbers only; nothing that identifies a user or a lecture."""
    completed = db.query(Lecture).filter(Lecture.status == LectureStatus.completed).count()
    failed = db.query(Lecture).filter(Lecture.status == LectureStatus.failed).count()
    seconds = (
        db.query(func.coalesce(func.sum(MediaAsset.duration_seconds), 0))
        .join(Lecture, Lecture.id == MediaAsset.lecture_id)
        .filter(Lecture.status == LectureStatus.completed)
        .scalar()
        or 0
    )
    jobs = (
        db.query(ProcessingJob)
        .filter(
            ProcessingJob.status == JobStatus.success,
            ProcessingJob.started_at.isnot(None),
            ProcessingJob.completed_at.isnot(None),
        )
        .all()
    )
    durations = [max(0, int((j.completed_at - j.started_at).total_seconds())) for j in jobs]
    processed = completed + failed
    return {
        "lectures": completed,
        "students": db.query(User).filter(User.role == RoleEnum.user).count(),
        "hours": round(seconds / 3600),
        "notes": db.query(Note).count(),
        "quizzes": db.query(QuizAttempt).count(),
        "avg_seconds": round(sum(durations) / len(durations)) if durations else 0,
        "success_rate": round(completed / processed * 100, 1) if processed else 0,
    }
