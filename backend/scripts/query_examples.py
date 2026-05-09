from app.database.repository import get_offers


def main():
    print("=== All offers ===")
    all_offers = get_offers(limit=5)
    for o in all_offers:
        print(f"  {o.title} ({o.experience_level}) @ {o.company_name}")

    print("\n=== Junior offers ===")
    juniors = get_offers(experience_level="junior", limit=5)
    for o in juniors:
        print(f"  {o.title} @ {o.company_name}")

    print("\n=== Remote offers ===")
    remotes = get_offers(workplace_type="remote", limit=5)
    for o in remotes:
        print(f"  {o.title} ({o.workplace_type}) @ {o.company_name}")

    print("\n=== Internships ===")
    internships = get_offers(working_time="internship", limit=10)
    for o in internships:
        print(f"  {o.title} @ {o.company_name}")

    print("\n=== Python jobs ===")
    python_jobs = get_offers(skill="Python", limit=5)
    for o in python_jobs:
        print(f"  {o.title} @ {o.company_name}")
        print(f"    Skills: {o.required_skills}")

    print("\n=== Combined: junior + remote ===")
    junior_remote = get_offers(experience_level="junior", workplace_type="remote", limit=5)
    for o in junior_remote:
        print(f"  {o.title} @ {o.company_name}")

    print("\n=== Offers in Warszawa ===")
    warsaw = get_offers(city="Warszawa", limit=5)
    for o in warsaw:
        print(f"  {o.title} @ {o.company_name}")


if __name__ == "__main__":
    main()