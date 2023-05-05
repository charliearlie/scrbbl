type Props = {
  profilePhoto: string;
  scrobbleCount: string;
  username: string;
};
export default function UserProfileNavButton({
  profilePhoto,
  scrobbleCount,
  username,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <img className="h-10 w-10 rounded-full" src={profilePhoto} />
      <div className="">
        <p className="text-xl">{username}</p>
        <p className="text-sm">Scrobbles: {scrobbleCount}</p>
      </div>
    </div>
  );
}
