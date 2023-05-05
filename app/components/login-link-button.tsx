type Props = {
  redirect?: string;
};

export default function LoginButton({ redirect = "/" }: Props) {
  return (
    <a
      href={`http://www.last.fm/api/auth/?api_key=5e51b3c171721101d22f4101dd227f66&cb=${redirect}`}
      className="button button-danger gap-4"
    >
      Login with Last.FM
    </a>
  );
}
