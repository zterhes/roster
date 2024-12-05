"use client";

import MatchPage from "@/components/MatchPage";
import { useParams } from "next/navigation";

export default function EditMatch() {
	const { id } = useParams();
	return <MatchPage id={id?.[0]} />;
}
