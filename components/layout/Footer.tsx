const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E5E3] mt-24">
      <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-8">
        <p className="text-[0.8125rem] text-[#6B7280]">
          ©{CURRENT_YEAR} MeoCuti. Code - Enjoy Life.
        </p>
      </div>
    </footer>
  );
}
