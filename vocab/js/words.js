// Built-in list of advanced (C1/C2) words. One per line:
//   word | IPA (US) | level | Mongolian meaning | intermediate (B1/B2) equivalents, comma-separated
// Works offline; online APIs (when reachable) add audio, definitions and more synonyms on top.
(function () {
  const RAW = `
abate|/əˈbeɪt/|C2|буурах, намдах|decrease, lessen, reduce
aberration|/ˌæbəˈreɪʃən/|C2|хэвийн бус зүйл|exception, mistake, strange case
abhor|/əbˈhɔːr/|C2|жигших, үзэн ядах|hate, can't stand, dislike
abstain|/əbˈsteɪn/|C2|татгалзах, цээрлэх|avoid, stay away from, not vote
abundant|/əˈbʌndənt/|C1|элбэг, их|plentiful, lots of, rich
accentuate|/əkˈsentʃueɪt/|C2|онцлох|emphasize, highlight, stress
accolade|/ˈækəleɪd/|C2|магтаал, шагнал|award, praise, honor
acquiesce|/ˌækwiˈes/|C2|дуугүй зөвшөөрөх|agree, accept, give in
acquire|/əˈkwaɪər/|C1|олж авах|get, gain, obtain
acrimonious|/ˌækrɪˈmoʊniəs/|C2|ширүүн, хорсолтой|angry, bitter, unfriendly
acumen|/ˈækjəmən/|C2|авхаалж, ухаан|good judgment, skill, cleverness
adamant|/ˈædəmənt/|C2|хатуу зогссон, няцашгүй|firm, determined, stubborn
adept|/əˈdept/|C2|чадварлаг, гарамгай|skilled, good at, expert
adhere|/ədˈhɪr/|C1|баримтлах, наалдах|follow, stick to, obey
admonish|/ədˈmɑːnɪʃ/|C2|сануулах, зэмлэх|warn, scold, criticize
adroit|/əˈdrɔɪt/|C2|авхаалжтай|skillful, clever, quick
adverse|/ædˈvɜːrs/|C1|сөрөг, таагүй|harmful, negative, bad
advocate|/ˈædvəkeɪt/|C1|дэмжих, өмгөөлөх|support, recommend, argue for
aesthetic|/esˈθetɪk/|C1|гоо зүйн|artistic, beautiful, visual
affable|/ˈæfəbəl/|C2|эелдэг, найрсаг|friendly, pleasant, easy to talk to
affluent|/ˈæfluənt/|C2|чинээлэг, баян|rich, wealthy, well-off
aggravate|/ˈæɡrəveɪt/|C2|улам хүндрүүлэх; уурлуулах|make worse, annoy, worsen
alacrity|/əˈlækrəti/|C2|шуурхай бэлэн байдал|eagerness, speed, readiness
alleviate|/əˈliːvieɪt/|C2|хөнгөвчлөх, намдаах|reduce, ease, relieve
aloof|/əˈluːf/|C2|хөндий, ойртохгүй|distant, unfriendly, cold
altruistic|/ˌæltruˈɪstɪk/|C2|бусдын төлөө сэтгэлтэй|unselfish, generous, kind
ambiguous|/æmˈbɪɡjuəs/|C1|хоёрдмол утгатай|unclear, confusing, uncertain
ambivalent|/æmˈbɪvələnt/|C2|хоёрдмол сэтгэлтэй|unsure, mixed feelings, uncertain
ameliorate|/əˈmiːliəreɪt/|C2|сайжруулах|improve, make better, fix
amiable|/ˈeɪmiəbəl/|C2|найрсаг, эелдэг|friendly, pleasant, kind
amicable|/ˈæmɪkəbəl/|C2|эв найртай|friendly, peaceful, polite
anachronism|/əˈnækrənɪzəm/|C2|цаг үеэ олоогүй зүйл|outdated thing, old-fashioned, out of time
animosity|/ˌænɪˈmɑːsəti/|C2|дайсагнал, хорсол|hatred, dislike, anger
anomaly|/əˈnɑːməli/|C2|хэвийн бус үзэгдэл|exception, strange thing, oddity
antagonize|/ænˈtæɡənaɪz/|C2|дайсагнуулах|annoy, upset, make an enemy of
antithesis|/ænˈtɪθəsɪs/|C2|эсрэг тал|opposite, contrast, reverse
apathy|/ˈæpəθi/|C1|хайхрамжгүй байдал|lack of interest, boredom, not caring
appease|/əˈpiːz/|C2|тайтгаруулах, зөөлрүүлэх|calm, satisfy, please
apprehensive|/ˌæprɪˈhensɪv/|C2|түгшсэн, санаа зовсон|worried, nervous, anxious
arbitrary|/ˈɑːrbɪtreri/|C1|дур зоргын|random, unfair, by chance
archaic|/ɑːrˈkeɪɪk/|C2|эртний, хуучны|old, ancient, outdated
ardent|/ˈɑːrdənt/|C2|халуун, туйлын|passionate, eager, keen
arduous|/ˈɑːrdʒuəs/|C2|хүнд хэцүү, ядаргаатай|difficult, hard, tiring
articulate|/ɑːrˈtɪkjəleɪt/|C1|тод ойлгомжтой илэрхийлэх|express, explain clearly, clear
ascertain|/ˌæsərˈteɪn/|C2|тодорхойлох, олж мэдэх|find out, discover, check
assiduous|/əˈsɪdʒuəs/|C2|хичээнгүй, нягт|hardworking, careful, thorough
assuage|/əˈsweɪdʒ/|C2|тайвшруулах, намдаах|calm, ease, relieve
astute|/əˈstuːt/|C2|гярхай, ухаалаг|clever, smart, sharp
atrocious|/əˈtroʊʃəs/|C2|аймшигтай муу|terrible, awful, horrible
audacious|/ɔːˈdeɪʃəs/|C2|зоримог, эрэлхэг|bold, brave, daring
augment|/ɔːɡˈment/|C2|нэмэгдүүлэх|increase, add to, boost
auspicious|/ɔːˈspɪʃəs/|C2|өлзийтэй, сайн ёрын|promising, lucky, favorable
austere|/ɔːˈstɪr/|C2|даруу, хатуу чанга|strict, simple, plain
autonomous|/ɔːˈtɑːnəməs/|C1|бие даасан|independent, self-governing, free
avarice|/ˈævərɪs/|C2|шунал, ховдог|greed, selfishness, love of money
banal|/bəˈnɑːl/|C2|улиг, уйтгартай|boring, ordinary, unoriginal
belligerent|/bəˈlɪdʒərənt/|C2|дайрамхай, хэрүүлч|aggressive, unfriendly, angry
benevolent|/bəˈnevələnt/|C2|энэрэнгүй, сайхан сэтгэлтэй|kind, generous, caring
benign|/bɪˈnaɪn/|C2|хоргүй, зөөлөн|harmless, gentle, kind
bewildered|/bɪˈwɪldərd/|C2|балмагдсан, эргэлзсэн|confused, puzzled, surprised
bolster|/ˈboʊlstər/|C2|бэхжүүлэх, дэмжих|support, strengthen, boost
brevity|/ˈbrevəti/|C2|товчлол|shortness, being brief, quickness
brusque|/brʌsk/|C2|ширүүн товч|rude, abrupt, short
burgeoning|/ˈbɜːrdʒənɪŋ/|C2|хурдан өсч буй|growing, expanding, booming
cacophony|/kəˈkɑːfəni/|C2|чимээ шуугиан|loud noise, noise, chaos
cajole|/kəˈdʒoʊl/|C2|аргадаж ятгах|persuade, coax, talk into
callous|/ˈkæləs/|C2|хатуу сэтгэлтэй|cruel, heartless, unkind
camaraderie|/ˌkɑːməˈrɑːdəri/|C2|нөхөрлөл, андын холбоо|friendship, team spirit, companionship
candid|/ˈkændɪd/|C2|илэн далангүй|honest, open, direct
capricious|/kəˈprɪʃəs/|C2|хувирамтгай, ааштай|unpredictable, changeable, moody
catalyst|/ˈkætəlɪst/|C1|түлхэц, хурдасгагч|trigger, cause, stimulus
catastrophic|/ˌkætəˈstrɑːfɪk/|C1|сүйрлийн|terrible, disastrous, very bad
caustic|/ˈkɔːstɪk/|C2|хурц, хорон (үг)|sarcastic, harsh, bitter
censure|/ˈsenʃər/|C2|зэмлэл, буруушаал|criticism, blame, disapproval
chicanery|/ʃɪˈkeɪnəri/|C2|луйвар заль|trickery, deception, cheating
circumspect|/ˈsɜːrkəmspekt/|C2|болгоомжтой|careful, cautious, watchful
circumvent|/ˌsɜːrkəmˈvent/|C2|тойрч гарах|avoid, get around, bypass
clandestine|/klænˈdestɪn/|C2|нууц, далд|secret, hidden, undercover
coalesce|/ˌkoʊəˈles/|C2|нэгдэх|combine, unite, come together
cogent|/ˈkoʊdʒənt/|C2|үнэмшилтэй (аргумент)|convincing, strong, persuasive
cognizant|/ˈkɑːɡnɪzənt/|C2|ухамсарласан, мэдэж буй|aware, conscious, informed
coherent|/koʊˈhɪrənt/|C1|уялдаатай, логиктой|clear, logical, organized
collaborate|/kəˈlæbəreɪt/|C1|хамтран ажиллах|work together, cooperate, team up
colloquial|/kəˈloʊkwiəl/|C2|ярианы, албан бус|informal, conversational, everyday
commence|/kəˈmens/|C1|эхлэх|start, begin, open
commensurate|/kəˈmenʃərət/|C2|тохирсон, дүйцэхүйц|equal, proportional, matching
compassionate|/kəmˈpæʃənət/|C1|энэрэнгүй|kind, caring, sympathetic
complacent|/kəmˈpleɪsənt/|C2|сэтгэл ханамжинд умбасан|self-satisfied, careless, too relaxed
comprehend|/ˌkɑːmprɪˈhend/|C1|ойлгох|understand, grasp, follow
comprehensive|/ˌkɑːmprɪˈhensɪv/|C1|иж бүрэн|complete, full, thorough
concede|/kənˈsiːd/|C1|хүлээн зөвшөөрөх|admit, accept, give up
conceal|/kənˈsiːl/|C1|нуух|hide, cover, keep secret
concise|/kənˈsaɪs/|C1|товч тодорхой|short, brief, clear
condone|/kənˈdoʊn/|C2|үл тоомсорлон зөвшөөрөх|accept, allow, excuse
conducive|/kənˈduːsɪv/|C2|таатай нөхцөл бүрдүүлэх|helpful, favorable, good for
confound|/kənˈfaʊnd/|C2|будлиулах, гайхшруулах|confuse, puzzle, surprise
congenial|/kənˈdʒiːniəl/|C2|таатай, эвтэйхэн|pleasant, friendly, agreeable
conjecture|/kənˈdʒektʃər/|C2|таамаг|guess, theory, opinion
conscientious|/ˌkɑːnʃiˈenʃəs/|C2|ухамсартай, хичээнгүй|careful, hardworking, responsible
consensus|/kənˈsensəs/|C1|нэгдсэн санал|agreement, general opinion, harmony
conspicuous|/kənˈspɪkjuəs/|C2|илт харагдах|obvious, noticeable, clear
contemplate|/ˈkɑːntəmpleɪt/|C1|эргэцүүлэх, бодох|think about, consider, plan
contemporary|/kənˈtempəreri/|C1|орчин үеийн|modern, current, present-day
contentious|/kənˈtenʃəs/|C2|маргаантай|controversial, disputed, arguable
contrite|/kənˈtraɪt/|C2|гэмшсэн|sorry, regretful, ashamed
conundrum|/kəˈnʌndrəm/|C2|хүндрэл, оньсого|problem, puzzle, dilemma
convoluted|/ˈkɑːnvəluːtɪd/|C2|ээдрээтэй|complicated, confusing, complex
copious|/ˈkoʊpiəs/|C2|их хэмжээний|plentiful, large amount, lots of
corroborate|/kəˈrɑːbəreɪt/|C2|нотлох, баталгаажуулах|confirm, support, prove
credible|/ˈkredəbəl/|C1|итгэл үнэмшилтэй|believable, reliable, trustworthy
credulous|/ˈkredʒələs/|C2|итгэмтгий|trusting, naive, easily fooled
culpable|/ˈkʌlpəbəl/|C2|гэм буруутай|guilty, responsible, to blame
cumbersome|/ˈkʌmbərsəm/|C2|болхи, төвөгтэй|heavy, awkward, difficult
cursory|/ˈkɜːrsəri/|C2|өнгөц|quick, brief, hasty
curtail|/kɜːrˈteɪl/|C2|хязгаарлах, танах|reduce, limit, cut
cynical|/ˈsɪnɪkəl/|C1|үл итгэгч, ёжтой|distrustful, negative, doubtful
dearth|/dɜːrθ/|C2|хомсдол|lack, shortage, absence
debilitating|/dɪˈbɪlɪteɪtɪŋ/|C2|сульдаах, тамирдуулах|weakening, exhausting, damaging
decorum|/dɪˈkɔːrəm/|C2|ёс журам|good manners, politeness, proper behavior
deference|/ˈdefərəns/|C2|хүндэтгэл, дагах|respect, politeness, obedience
deleterious|/ˌdeləˈtɪriəs/|C2|хортой|harmful, damaging, bad
delineate|/dɪˈlɪnieɪt/|C2|тодорхойлох, зааглах|describe, outline, define
demeanor|/dɪˈmiːnər/|C2|төрх байдал|behavior, manner, attitude
denounce|/dɪˈnaʊns/|C2|буруушаах|criticize, condemn, attack
deplete|/dɪˈpliːt/|C1|шавхах, хорогдуулах|use up, reduce, drain
deride|/dɪˈraɪd/|C2|шоолох|mock, laugh at, make fun of
despondent|/dɪˈspɑːndənt/|C2|гутарсан|sad, hopeless, depressed
deter|/dɪˈtɜːr/|C1|сэргийлэх, цааргалуулах|discourage, stop, prevent
detrimental|/ˌdetrɪˈmentəl/|C1|хортой|harmful, damaging, bad
devious|/ˈdiːviəs/|C2|заль мэхтэй|dishonest, sly, tricky
diatribe|/ˈdaɪətraɪb/|C2|ширүүн шүүмж|attack, angry speech, criticism
dichotomy|/daɪˈkɑːtəmi/|C2|хуваагдал, эсрэгцэл|division, contrast, split
didactic|/daɪˈdæktɪk/|C2|сургамжит|educational, teaching, instructive
diffident|/ˈdɪfɪdənt/|C2|ичимхий, итгэлгүй|shy, unsure, timid
digress|/daɪˈɡres/|C2|сэдвээс хазайх|go off topic, wander, stray
diligent|/ˈdɪlɪdʒənt/|C1|хичээнгүй, ажилсаг|hardworking, careful, thorough
diminish|/dɪˈmɪnɪʃ/|C1|багасах|reduce, decrease, lessen
discern|/dɪˈsɜːrn/|C2|ялгаж таних|notice, see, recognize
discrepancy|/dɪˈskrepənsi/|C1|зөрүү, зөрөө|difference, mismatch, gap
disdain|/dɪsˈdeɪn/|C2|жигшил, дорд үзэх|dislike, contempt, looking down on
disparage|/dɪˈspærɪdʒ/|C2|басамжлах|criticize, belittle, put down
disparity|/dɪˈspærəti/|C2|тэгш бус байдал, ялгаа|difference, gap, inequality
disseminate|/dɪˈsemɪneɪt/|C2|түгээх, дэлгэрүүлэх|spread, share, distribute
divulge|/daɪˈvʌldʒ/|C2|задруулах|reveal, tell, disclose
dogmatic|/dɔːɡˈmætɪk/|C2|зөрүүд үзэлтэй|stubborn, rigid, opinionated
dubious|/ˈduːbiəs/|C1|эргэлзээтэй|doubtful, uncertain, suspicious
duplicity|/duːˈplɪsəti/|C2|хоёр нүүр|dishonesty, deceit, cheating
ebullient|/ɪˈbʊliənt/|C2|хөөрсөн, баяр баясгалантай|cheerful, excited, lively
eclectic|/ɪˈklektɪk/|C2|олон төрлийн|varied, diverse, mixed
efficacious|/ˌefɪˈkeɪʃəs/|C2|үр дүнтэй|effective, successful, useful
egregious|/ɪˈɡriːdʒəs/|C2|илт муу, аймшигтай|terrible, shocking, awful
elated|/ɪˈleɪtɪd/|C2|баярлаж хөөрсөн|very happy, delighted, thrilled
eloquent|/ˈeləkwənt/|C1|уран яруу|fluent, expressive, persuasive
elucidate|/ɪˈluːsɪdeɪt/|C2|тодруулах|explain, clarify, make clear
elusive|/ɪˈluːsɪv/|C1|баригдашгүй, олдохгүй|hard to find, hard to catch, slippery
embellish|/ɪmˈbelɪʃ/|C1|чимэглэх; хэтрүүлэх|decorate, exaggerate, add to
empathy|/ˈempəθi/|C1|бусдыг ойлгох сэтгэл|understanding, sympathy, compassion
empirical|/ɪmˈpɪrɪkəl/|C1|туршлагад суурилсан|practical, observed, experimental
emulate|/ˈemjəleɪt/|C2|дуурайх, үлгэрлэх|copy, imitate, follow
encompass|/ɪnˈkʌmpəs/|C1|хамрах|include, cover, contain
endeavor|/ɪnˈdevər/|C1|оролдлого, хичээл зүтгэл|try, attempt, effort
enervate|/ˈenərveɪt/|C2|сульдаах|tire, weaken, exhaust
enhance|/ɪnˈhæns/|C1|сайжруулах|improve, increase, boost
enigmatic|/ˌenɪɡˈmætɪk/|C2|оньсого мэт, нууцлаг|mysterious, puzzling, strange
entice|/ɪnˈtaɪs/|C2|уруу татах|attract, tempt, lure
ephemeral|/ɪˈfemərəl/|C2|түр зуурын|temporary, short-lived, brief
epitome|/ɪˈpɪtəmi/|C2|тод жишээ|perfect example, typical example, model
equanimity|/ˌekwəˈnɪməti/|C2|тайван байдал|calmness, composure, balance
equivocal|/ɪˈkwɪvəkəl/|C2|хоёрдмол, тодорхойгүй|unclear, vague, uncertain
eradicate|/ɪˈrædɪkeɪt/|C2|устгах, үндсээр нь арилгах|remove, destroy, get rid of
erratic|/ɪˈrætɪk/|C2|тогтворгүй|unpredictable, irregular, inconsistent
erroneous|/ɪˈroʊniəs/|C2|алдаатай, буруу|wrong, incorrect, false
erudite|/ˈerjədaɪt/|C2|эрдэм мэдлэгтэй|learned, educated, knowledgeable
esoteric|/ˌesəˈterɪk/|C2|цөөн хүний ойлгох|little-known, specialized, mysterious
estrange|/ɪˈstreɪndʒ/|C2|хөндийрүүлэх|separate, alienate, drive apart
euphemism|/ˈjuːfəmɪzəm/|C2|зөөлрүүлсэн үг|polite term, softer word, indirect expression
exacerbate|/ɪɡˈzæsərbeɪt/|C2|улам дордуулах|worsen, make worse, increase
exasperate|/ɪɡˈzæspəreɪt/|C2|бухимдуулах|annoy, frustrate, irritate
exemplary|/ɪɡˈzempləri/|C2|үлгэр жишээ|excellent, perfect, model
exhaustive|/ɪɡˈzɔːstɪv/|C1|бүрэн гүйцэд|thorough, complete, full
exhilarating|/ɪɡˈzɪləreɪtɪŋ/|C2|сэтгэл хөөргөм|exciting, thrilling, fun
exonerate|/ɪɡˈzɑːnəreɪt/|C2|цагаатгах|clear, free from blame, excuse
exorbitant|/ɪɡˈzɔːrbɪtənt/|C2|хэт өндөр (үнэ)|very expensive, excessive, too high
expedient|/ɪkˈspiːdiənt/|C2|ашигтай, тохиромжтой|convenient, practical, useful
expedite|/ˈekspədaɪt/|C2|түргэтгэх|speed up, hurry, accelerate
explicit|/ɪkˈsplɪsɪt/|C1|тодорхой, шууд|clear, direct, detailed
extol|/ɪkˈstoʊl/|C2|магтан дуулах|praise, celebrate, admire
extraneous|/ɪkˈstreɪniəs/|C2|гадны, хамааралгүй|irrelevant, unnecessary, extra
exuberant|/ɪɡˈzuːbərənt/|C2|эрч хүчтэй, хөөрсөн|energetic, cheerful, enthusiastic
fabricate|/ˈfæbrɪkeɪt/|C1|зохиох, хуурамчаар хийх|invent, make up, fake
facetious|/fəˈsiːʃəs/|C2|алиа, онигоо|joking, silly, playful
facilitate|/fəˈsɪlɪteɪt/|C1|хөнгөвчлөх, дэмжих|help, make easier, assist
fallacy|/ˈfæləsi/|C1|буруу ойлголт|mistake, false belief, myth
fastidious|/fæˈstɪdiəs/|C2|нямбай, шилэгч|picky, careful, fussy
fathom|/ˈfæðəm/|C2|гүнзгий ойлгох|understand, figure out, grasp
feasible|/ˈfiːzəbəl/|C1|хэрэгжих боломжтой|possible, practical, realistic
fervent|/ˈfɜːrvənt/|C2|халуун сэтгэлтэй|passionate, eager, enthusiastic
fickle|/ˈfɪkəl/|C2|хувирамтгай|changeable, unreliable, inconsistent
flagrant|/ˈfleɪɡrənt/|C2|илт (муу)|obvious, shocking, open
flamboyant|/flæmˈbɔɪənt/|C2|гоёмсог, тод|showy, colorful, bold
flaunt|/flɔːnt/|C2|гайхуулах|show off, display, parade
florid|/ˈflɔːrɪd/|C2|хэт чимэглэсэн|fancy, decorated, elaborate
fluctuate|/ˈflʌktʃueɪt/|C1|хэлбэлзэх|change, vary, go up and down
formidable|/ˈfɔːrmɪdəbəl/|C1|сүрдмээр, хүчирхэг|impressive, powerful, difficult
fortuitous|/fɔːrˈtuːɪtəs/|C2|санамсаргүй азтай|lucky, by chance, accidental
fraught|/frɔːt/|C2|(аюулаар) дүүрэн, түгшүүртэй|full of, filled with, tense
frivolous|/ˈfrɪvələs/|C2|хөнгөмсөг, ач холбогдолгүй|silly, unimportant, foolish
frugal|/ˈfruːɡəl/|C2|гамтай, хэмнэлттэй|economical, careful, simple
futile|/ˈfjuːtəl/|C1|дэмий, үр дүнгүй|useless, pointless, hopeless
garrulous|/ˈɡærələs/|C2|яриасаг|talkative, chatty, wordy
genial|/ˈdʒiːniəl/|C2|эелдэг, дулаахан|friendly, cheerful, warm
gratuitous|/ɡrəˈtuːɪtəs/|C2|шалтгаангүй, илүүц|unnecessary, unjustified, free
gregarious|/ɡrɪˈɡeriəs/|C2|нийтэч|sociable, friendly, outgoing
gullible|/ˈɡʌləbəl/|C2|итгэмтгий, хууртамтгай|easily fooled, naive, trusting
hackneyed|/ˈhæknid/|C2|улиг болсон|overused, boring, unoriginal
haphazard|/hæpˈhæzərd/|C2|эмх замбараагүй|random, careless, disorganized
harbinger|/ˈhɑːrbɪndʒər/|C2|дохио, зөгнөл|sign, signal, warning
haughty|/ˈhɔːti/|C2|бардам, ихэмсэг|proud, arrogant, snobbish
hedonistic|/ˌhiːdəˈnɪstɪk/|C2|таашаал хөөсөн|pleasure-seeking, self-indulgent, fun-loving
heinous|/ˈheɪnəs/|C2|аймшигт (гэмт хэрэг)|terrible, evil, shocking
hinder|/ˈhɪndər/|C1|саад болох|stop, slow down, block
hubris|/ˈhjuːbrɪs/|C2|хэт бардамнал|arrogance, pride, overconfidence
hypothetical|/ˌhaɪpəˈθetɪkəl/|C1|таамаглалын|imaginary, theoretical, possible
iconoclast|/aɪˈkɑːnəklæst/|C2|уламжлал эсэргүүцэгч|rebel, critic, radical
idiosyncratic|/ˌɪdiəsɪŋˈkrætɪk/|C2|өвөрмөц, өөрийн гэсэн|unusual, individual, strange
ignominious|/ˌɪɡnəˈmɪniəs/|C2|ичгүүртэй|shameful, embarrassing, humiliating
illicit|/ɪˈlɪsɪt/|C2|хууль бус|illegal, forbidden, unlawful
immaculate|/ɪˈmækjələt/|C2|өө сэвгүй цэвэр|spotless, perfectly clean, perfect
imminent|/ˈɪmɪnənt/|C1|ойртож буй, удахгүй болох|coming soon, about to happen, near
immutable|/ɪˈmjuːtəbəl/|C2|өөрчлөгдөшгүй|unchangeable, fixed, permanent
impartial|/ɪmˈpɑːrʃəl/|C1|шударга, хараат бус|fair, neutral, unbiased
impeccable|/ɪmˈpekəbəl/|C2|өө сэвгүй, төгс|perfect, flawless, excellent
impede|/ɪmˈpiːd/|C2|саатуулах|block, slow down, hold up
imperative|/ɪmˈperətɪv/|C1|зайлшгүй шаардлагатай|essential, necessary, vital
imperious|/ɪmˈpɪriəs/|C2|дарангуйлагч, захирангуй|bossy, arrogant, domineering
impetuous|/ɪmˈpetʃuəs/|C2|яаруу, бодлогогүй|impulsive, hasty, careless
implacable|/ɪmˈplækəbəl/|C2|эвлэршгүй|unforgiving, unstoppable, determined
implicit|/ɪmˈplɪsɪt/|C1|далд, шууд бус|hidden, implied, unspoken
impromptu|/ɪmˈprɑːmptuː/|C2|урьдчилан бэлтгээгүй|unplanned, spontaneous, improvised
imprudent|/ɪmˈpruːdənt/|C2|болгоомжгүй, ухаангүй|unwise, careless, reckless
impudent|/ˈɪmpjədənt/|C2|бүдүүлэг, ичгүүргүй|rude, cheeky, disrespectful
inadvertent|/ˌɪnədˈvɜːrtənt/|C2|санамсаргүй|accidental, unintentional, careless
incessant|/ɪnˈsesənt/|C2|тасралтгүй|constant, nonstop, endless
incisive|/ɪnˈsaɪsɪv/|C2|хурц ухаалаг|sharp, clear, direct
incongruous|/ɪnˈkɑːŋɡruəs/|C2|нийцгүй, зохисгүй|out of place, strange, inappropriate
incorrigible|/ɪnˈkɔːrɪdʒəbəl/|C2|засаршгүй|hopeless, incurable, unchangeable
indifferent|/ɪnˈdɪfərənt/|C1|хайхрамжгүй|uninterested, unconcerned, cold
indignant|/ɪnˈdɪɡnənt/|C2|уурласан, гомдсон|angry, annoyed, offended
indispensable|/ˌɪndɪˈspensəbəl/|C1|зайлшгүй хэрэгтэй|essential, necessary, vital
indolent|/ˈɪndələnt/|C2|залхуу|lazy, idle, inactive
indulgent|/ɪnˈdʌldʒənt/|C2|эрхлүүлсэн, зөөлөн|generous, permissive, tolerant
ineffable|/ɪnˈefəbəl/|C2|үгээр илэрхийлэхийн аргагүй|indescribable, beyond words, amazing
inept|/ɪˈnept/|C2|чадваргүй, болхи|clumsy, incompetent, unskilled
inevitable|/ɪnˈevɪtəbəl/|C1|зайлшгүй болох|certain, unavoidable, sure
inexorable|/ɪnˈeksərəbəl/|C2|зогсоошгүй|unstoppable, nonstop, certain
infallible|/ɪnˈfæləbəl/|C2|алдаагүй, эндэшгүй|perfect, never wrong, reliable
infamous|/ˈɪnfəməs/|C1|муу нэртэй|famous for bad things, well-known, shameful
ingenious|/ɪnˈdʒiːniəs/|C1|овсгоотой, ухаалаг|clever, creative, smart
ingenuous|/ɪnˈdʒenjuəs/|C2|гэнэн, цагаан сэтгэлтэй|innocent, naive, honest
inherent|/ɪnˈhɪrənt/|C1|угаасаа байдаг|natural, built-in, basic
innate|/ɪˈneɪt/|C2|төрөлхийн|natural, inborn, born with
innocuous|/ɪˈnɑːkjuəs/|C2|хоргүй|harmless, safe, inoffensive
innovative|/ˈɪnəveɪtɪv/|C1|шинэлэг|new, creative, original
inquisitive|/ɪnˈkwɪzətɪv/|C1|сониуч|curious, questioning, interested
insatiable|/ɪnˈseɪʃəbəl/|C2|ханашгүй|endless, greedy, unstoppable
insidious|/ɪnˈsɪdiəs/|C2|далдаар хор хүргэх|sneaky, harmful, hidden
insipid|/ɪnˈsɪpɪd/|C2|амтгүй, уйтгартай|bland, boring, dull
insolent|/ˈɪnsələnt/|C2|бүдүүлэг, хүндлэлгүй|rude, disrespectful, cheeky
instigate|/ˈɪnstɪɡeɪt/|C2|өдөөх, эхлүүлэх|start, cause, provoke
intangible|/ɪnˈtændʒəbəl/|C2|биет бус|abstract, invisible, hard to define
intermittent|/ˌɪntərˈmɪtənt/|C2|үе үе, тасалдсан|occasional, irregular, on and off
intransigent|/ɪnˈtrænzɪdʒənt/|C2|буулт хийдэггүй|stubborn, inflexible, uncompromising
intrepid|/ɪnˈtrepɪd/|C2|айдасгүй, эрэлхэг|brave, fearless, bold
intricate|/ˈɪntrɪkət/|C1|нарийн төвөгтэй|complicated, detailed, complex
intrinsic|/ɪnˈtrɪnzɪk/|C1|дотоод, угийн|natural, basic, essential
inundate|/ˈɪnəndeɪt/|C2|үерлэх, дарах|flood, overwhelm, fill
invariably|/ɪnˈveriəbli/|C2|үргэлж, ямагт|always, every time, constantly
irascible|/ɪˈræsəbəl/|C2|уурламтгай|bad-tempered, irritable, grumpy
irreverent|/ɪˈrevərənt/|C2|хүндэтгэлгүй|disrespectful, cheeky, mocking
jeopardize|/ˈdʒepərdaɪz/|C2|эрсдэлд оруулах|risk, endanger, threaten
jovial|/ˈdʒoʊviəl/|C2|хөгжилтэй, цайлган|cheerful, friendly, jolly
judicious|/dʒuːˈdɪʃəs/|C2|ухаалаг, тунгаасан|wise, sensible, careful
juxtapose|/ˈdʒʌkstəpoʊz/|C2|зэрэгцүүлэн харьцуулах|compare, contrast, place side by side
kudos|/ˈkuːdɑːs/|C2|магтаал, нэр хүнд|praise, credit, respect
laconic|/ləˈkɑːnɪk/|C2|товч ярьдаг|brief, short, using few words
lament|/ləˈment/|C2|гашуудах, харамсах|mourn, regret, complain about
latent|/ˈleɪtənt/|C2|далд, нуугдмал|hidden, inactive, undeveloped
laudable|/ˈlɔːdəbəl/|C2|магтууштай|praiseworthy, admirable, good
lavish|/ˈlævɪʃ/|C1|тансаг, өгөөмөр|luxurious, generous, expensive
lenient|/ˈliːniənt/|C2|зөөлөн, өршөөнгүй|soft, tolerant, not strict
lethargic|/ləˈθɑːrdʒɪk/|C2|сульдсан, залхуу|tired, sleepy, lazy
liaison|/liˈeɪzɑːn/|C2|холбоо, холбогч|connection, contact, link
litigious|/lɪˈtɪdʒəs/|C2|заргач|quick to sue, argumentative, quarrelsome
lucid|/ˈluːsɪd/|C2|тод ойлгомжтой|clear, understandable, sensible
lucrative|/ˈluːkrətɪv/|C2|ашигтай|profitable, well-paid, rewarding
lugubrious|/ləˈɡuːbriəs/|C2|гунигтай|sad, gloomy, miserable
luminous|/ˈluːmɪnəs/|C2|гэрэлтсэн|bright, shining, glowing
magnanimous|/mæɡˈnænɪməs/|C2|өгөөмөр, өршөөнгүй|generous, kind, forgiving
malevolent|/məˈlevələnt/|C2|хорон санаат|evil, cruel, harmful
malleable|/ˈmæliəbəl/|C2|уян хатан|flexible, adaptable, easily shaped
mandatory|/ˈmændətɔːri/|C1|заавал байх ёстой|required, compulsory, necessary
manifest|/ˈmænɪfest/|C1|илрэх; илт|show, display, obvious
meander|/miˈændər/|C2|тахиралдах, тэнүүчлэх|wander, wind, drift
melancholy|/ˈmelənkɑːli/|C2|уйтгар гуниг|sadness, sad, gloomy
mendacious|/menˈdeɪʃəs/|C2|худалч|lying, dishonest, untruthful
meticulous|/məˈtɪkjələs/|C2|нарийн нямбай|careful, detailed, thorough
mitigate|/ˈmɪtɪɡeɪt/|C2|зөөлрүүлэх, бууруулах|reduce, lessen, ease
mollify|/ˈmɑːlɪfaɪ/|C2|тайтгаруулах|calm down, soothe, please
morose|/məˈroʊs/|C2|гунигтай, дуугүй|gloomy, sad, unhappy
mundane|/mʌnˈdeɪn/|C2|энгийн, уйтгартай|ordinary, boring, everyday
munificent|/mjuːˈnɪfɪsənt/|C2|өгөөмөр|generous, giving, charitable
myriad|/ˈmɪriəd/|C2|тоо томшгүй|many, countless, lots of
nascent|/ˈnæsənt/|C2|дөнгөж үүсч буй|new, emerging, developing
nebulous|/ˈnebjələs/|C2|бүрхэг, тодорхойгүй|vague, unclear, hazy
nefarious|/nɪˈferiəs/|C2|хорон муу|evil, wicked, criminal
negligent|/ˈneɡlɪdʒənt/|C2|хайхрамжгүй|careless, irresponsible, lazy
nonchalant|/ˌnɑːnʃəˈlɑːnt/|C2|хайхрамжгүй тайван|calm, relaxed, casual
nostalgia|/nɑːˈstældʒə/|C1|өнгөрснөө санагалзах|longing for the past, homesickness, memories
notorious|/noʊˈtɔːriəs/|C1|муу нэрээр алдартай|well-known, famous, famous for bad things
novice|/ˈnɑːvɪs/|C1|шинэхэн, анхлан суралцагч|beginner, learner, newcomer
nuance|/ˈnuːɑːns/|C1|нарийн ялгаа|subtle difference, shade, detail
nullify|/ˈnʌlɪfaɪ/|C2|хүчингүй болгох|cancel, undo, invalidate
obdurate|/ˈɑːbdərət/|C2|хатуу зөрүүд|stubborn, unyielding, hard-hearted
obfuscate|/ˈɑːbfəskeɪt/|C2|будлиантуулах|confuse, hide, make unclear
oblivious|/əˈblɪviəs/|C2|мэдээгүй, анзаараагүй|unaware, not noticing, ignorant
obscure|/əbˈskjʊr/|C1|бүрхэг, үл мэдэгдэх|unclear, unknown, hidden
obsequious|/əbˈsiːkwiəs/|C2|бялдуучирхсан|too eager to please, flattering, overly polite
obsolete|/ˌɑːbsəˈliːt/|C1|хуучирсан|outdated, old, out of date
obstinate|/ˈɑːbstɪnət/|C2|зөрүүд|stubborn, determined, firm
ominous|/ˈɑːmɪnəs/|C2|муу ёрын|threatening, worrying, dark
omnipotent|/ɑːmˈnɪpətənt/|C2|хязгааргүй хүчтэй|all-powerful, mighty, supreme
onerous|/ˈoʊnərəs/|C2|хүнд дарамттай|heavy, difficult, demanding
opaque|/oʊˈpeɪk/|C2|тунгалаг бус, ойлгомжгүй|unclear, cloudy, hard to understand
opportune|/ˌɑːpərˈtuːn/|C2|тохиромжтой цагтаа|timely, convenient, lucky
opulent|/ˈɑːpjələnt/|C2|тансаг|luxurious, rich, expensive
ostentatious|/ˌɑːstenˈteɪʃəs/|C2|гайхуулсан, сагсуу|showy, flashy, fancy
ostracize|/ˈɑːstrəsaɪz/|C2|гадуурхах|exclude, reject, ignore
paradigm|/ˈpærədaɪm/|C1|загвар, үлгэр|model, pattern, example
paradox|/ˈpærədɑːks/|C1|парадокс, зөрчил|contradiction, puzzle, mystery
paragon|/ˈpærəɡɑːn/|C2|үлгэр жишээ|model, perfect example, ideal
paramount|/ˈpærəmaʊnt/|C2|хамгийн чухал|most important, main, essential
parsimonious|/ˌpɑːrsɪˈmoʊniəs/|C2|харам|stingy, mean, cheap
partisan|/ˈpɑːrtɪzən/|C2|нэг талыг баримтлагч|biased, one-sided, supporter
paucity|/ˈpɔːsəti/|C2|хомс, дутагдал|lack, shortage, small amount
pedantic|/pɪˈdæntɪk/|C2|хэт нарийвчлагч|fussy, picky, overly detailed
pejorative|/pɪˈdʒɔːrətɪv/|C2|доромжилсон утгатай|negative, insulting, critical
penchant|/ˈpentʃənt/|C2|дур сонирхол|liking, taste, tendency
perfunctory|/pərˈfʌŋktəri/|C2|хийсэн болох|quick, careless, routine
peripheral|/pəˈrɪfərəl/|C2|захын, хоёрдогч|minor, secondary, outer
pernicious|/pərˈnɪʃəs/|C2|хор хөнөөлтэй|harmful, damaging, dangerous
perpetual|/pərˈpetʃuəl/|C1|мөнхийн, тасралтгүй|constant, endless, permanent
perplexed|/pərˈplekst/|C2|эргэлзсэн, ойлгохгүй байгаа|confused, puzzled, unsure
persevere|/ˌpɜːrsəˈvɪr/|C1|тэвчээртэй үргэлжлүүлэх|keep going, continue, not give up
pertinent|/ˈpɜːrtənənt/|C2|холбогдолтой|relevant, related, appropriate
pervasive|/pərˈveɪsɪv/|C2|хаа сайгүй тархсан|widespread, common, general
petulant|/ˈpetʃələnt/|C2|ааш муутай|moody, grumpy, childish
philanthropic|/ˌfɪlənˈθrɑːpɪk/|C2|буяны, хүмүүнлэг|charitable, generous, kind
pivotal|/ˈpɪvətəl/|C1|шийдвэрлэх ач холбогдолтой|key, central, crucial
placate|/ˈpleɪkeɪt/|C2|тайвшруулах|calm, soothe, please
placid|/ˈplæsɪd/|C2|тайван, дөлгөөн|calm, peaceful, quiet
plausible|/ˈplɔːzəbəl/|C1|үнэмшилтэй|believable, likely, possible
plethora|/ˈpleθərə/|C2|хэт олон|lots of, plenty, excess
poignant|/ˈpɔɪnjənt/|C2|сэтгэл хөдөлгөм|moving, touching, sad
pragmatic|/præɡˈmætɪk/|C1|практик, бодитой|practical, realistic, sensible
precarious|/prɪˈkeriəs/|C2|эмзэг, найдваргүй|unstable, risky, dangerous
precedent|/ˈpresɪdənt/|C1|өмнөх жишиг|example, model, previous case
preclude|/prɪˈkluːd/|C2|боломжгүй болгох|prevent, stop, rule out
precocious|/prɪˈkoʊʃəs/|C2|эрт төлөвшсөн|advanced, gifted, mature for age
predilection|/ˌpredəˈlekʃən/|C2|илүүд үзэх хандлага|preference, liking, taste
prerogative|/prɪˈrɑːɡətɪv/|C2|онцгой эрх|right, privilege, choice
prevalent|/ˈprevələnt/|C1|түгээмэл|common, widespread, popular
pristine|/ˈprɪstiːn/|C2|анхны цэвэр|clean, perfect, untouched
proclivity|/proʊˈklɪvəti/|C2|хандлага, дур сонирхол|tendency, habit, liking
procrastinate|/proʊˈkræstɪneɪt/|C2|хойшлуулах, хойш тавих|delay, put off, postpone
prodigious|/prəˈdɪdʒəs/|C2|асар их|huge, enormous, amazing
proficient|/prəˈfɪʃənt/|C1|чадварлаг|skilled, good at, capable
profound|/prəˈfaʊnd/|C1|гүн гүнзгий|deep, serious, great
proliferate|/prəˈlɪfəreɪt/|C2|хурдан олшрох|spread, multiply, increase
prolific|/prəˈlɪfɪk/|C2|их бүтээлтэй|productive, creative, busy
propensity|/prəˈpensəti/|C2|хандлага|tendency, inclination, habit
propitious|/prəˈpɪʃəs/|C2|таатай, өлзийтэй|favorable, lucky, promising
prosaic|/proʊˈzeɪɪk/|C2|энгийн, уйтгартай|ordinary, dull, boring
proximity|/prɑːkˈsɪməti/|C1|ойр байдал|nearness, closeness, distance
prudent|/ˈpruːdənt/|C2|ухаалаг болгоомжтой|wise, careful, sensible
pugnacious|/pʌɡˈneɪʃəs/|C2|хэрүүлч, зодоонч|aggressive, argumentative, unfriendly
punctilious|/pʌŋkˈtɪliəs/|C2|нягт нямбай|careful, exact, precise
quandary|/ˈkwɑːndəri/|C2|тээнэгэлзэл|dilemma, difficult situation, problem
quell|/kwel/|C2|дарах, намжаах|stop, calm, put down
querulous|/ˈkwerələs/|C2|гомдолч|complaining, whining, grumpy
quintessential|/ˌkwɪntɪˈsenʃəl/|C2|жишиг, туйлын төгс|typical, perfect, classic
quixotic|/kwɪkˈsɑːtɪk/|C2|хий мөрөөдөлтэй|unrealistic, idealistic, impractical
rampant|/ˈræmpənt/|C2|хяналтгүй тархсан|widespread, uncontrolled, out of control
rancor|/ˈræŋkər/|C2|хорсол|bitterness, hatred, resentment
rapport|/ræˈpɔːr/|C2|харилцан ойлголцол|connection, understanding, relationship
recalcitrant|/rɪˈkælsɪtrənt/|C2|дуулгаваргүй|stubborn, disobedient, difficult
reciprocate|/rɪˈsɪprəkeɪt/|C2|хариу үзүүлэх|return, respond, pay back
reclusive|/rɪˈkluːsɪv/|C2|ганцаардмал|lonely, private, shy
rectify|/ˈrektɪfaɪ/|C1|засах|fix, correct, repair
redundant|/rɪˈdʌndənt/|C1|илүүц|unnecessary, extra, repetitive
refute|/rɪˈfjuːt/|C1|няцаах|prove wrong, deny, reject
relegate|/ˈreləɡeɪt/|C2|доош шилжүүлэх|demote, move down, downgrade
relentless|/rɪˈlentləs/|C1|өршөөлгүй, зогсолтгүй|constant, nonstop, determined
relinquish|/rɪˈlɪŋkwɪʃ/|C2|татгалзах, шилжүүлэн өгөх|give up, let go, surrender
reluctant|/rɪˈlʌktənt/|C1|дурамжхан|unwilling, hesitant, not keen
remorse|/rɪˈmɔːrs/|C2|гэмшил|regret, guilt, sorrow
replete|/rɪˈpliːt/|C2|дүүрэн|full, filled, packed
reprehensible|/ˌreprɪˈhensəbəl/|C2|буруушаахуйц|shameful, wrong, unacceptable
repudiate|/rɪˈpjuːdieɪt/|C2|үгүйсгэх|reject, deny, refuse
rescind|/rɪˈsɪnd/|C2|цуцлах|cancel, withdraw, take back
resilient|/rɪˈzɪliənt/|C1|тэсвэртэй, хурдан сэргэдэг|strong, tough, flexible
resolute|/ˈrezəluːt/|C1|шийдэмгий|determined, firm, decided
reticent|/ˈretɪsənt/|C2|дуу цөөтэй|quiet, shy, reserved
reverence|/ˈrevərəns/|C2|гүн хүндэтгэл|respect, admiration, honor
rhetoric|/ˈretərɪk/|C1|уран илтгэх ур; хоосон үг|persuasive speech, speech, empty words
robust|/roʊˈbʌst/|C1|бат бөх|strong, healthy, sturdy
rudimentary|/ˌruːdɪˈmentəri/|C2|анхан шатны|basic, simple, elementary
ruthless|/ˈruːθləs/|C1|хэрцгий|cruel, merciless, harsh
sagacious|/səˈɡeɪʃəs/|C2|мэргэн ухаантай|wise, clever, smart
salient|/ˈseɪliənt/|C2|гол, тод харагдах|main, important, noticeable
sanction|/ˈsæŋkʃən/|C1|зөвшөөрөл; хориг арга хэмжээ|permission, approval, penalty
sanguine|/ˈsæŋɡwɪn/|C2|өөдрөг|optimistic, positive, hopeful
sardonic|/sɑːrˈdɑːnɪk/|C2|ёжтой|mocking, sarcastic, distrustful
scrupulous|/ˈskruːpjələs/|C2|шударга, нягт нямбай|honest, careful, thorough
scrutinize|/ˈskruːtənaɪz/|C2|нягтлан шалгах|examine, inspect, check carefully
sedentary|/ˈsedənteri/|C1|суугаа, хөдөлгөөн багатай|inactive, seated, lazy
serendipity|/ˌserənˈdɪpəti/|C2|азтай тохиол|luck, lucky chance, coincidence
serene|/səˈriːn/|C2|амгалан тайван|calm, peaceful, quiet
servile|/ˈsɜːrvaɪl/|C2|боолч, долдой|obedient, submissive, humble
skeptical|/ˈskeptɪkəl/|C1|эргэлзэгч|doubtful, unsure, suspicious
solace|/ˈsɑːlɪs/|C2|тайтгарал|comfort, relief, support
solicit|/səˈlɪsɪt/|C2|гуйх, хүсэх|ask for, request, seek
somber|/ˈsɑːmbər/|C2|гунигтай, бараан|dark, serious, gloomy
soporific|/ˌsɑːpəˈrɪfɪk/|C2|нойрмоглуулам|sleepy, boring, sleep-inducing
sporadic|/spəˈrædɪk/|C2|үе үе, тасархай|occasional, irregular, rare
spurious|/ˈspjʊriəs/|C2|хуурамч, худал|false, fake, wrong
squalid|/ˈskwɑːlɪd/|C2|бохир заваан|dirty, filthy, poor
squander|/ˈskwɑːndər/|C2|үрэх, дэмий үрэх|waste, throw away, misuse
stagnant|/ˈstæɡnənt/|C2|зогсонги|still, inactive, not moving
staunch|/stɔːntʃ/|C2|үнэнч, тууштай|loyal, firm, strong
stoic|/ˈstoʊɪk/|C2|тэсвэртэй, тайван|calm, patient, uncomplaining
stringent|/ˈstrɪndʒənt/|C1|хатуу чанга|strict, tough, severe
stymie|/ˈstaɪmi/|C2|саад болох|block, stop, prevent
subjugate|/ˈsʌbdʒəɡeɪt/|C2|эрхшээлдээ оруулах|conquer, control, defeat
sublime|/səˈblaɪm/|C2|сүр жавхлант, гайхамшигтай|wonderful, beautiful, excellent
subordinate|/səˈbɔːrdɪnət/|C1|доод албан тушаалтан|employee, junior, lower in rank
substantial|/səbˈstænʃəl/|C1|их хэмжээний|large, significant, considerable
subtle|/ˈsʌtəl/|C1|нарийн, бага зэрэг|slight, delicate, not obvious
succinct|/səkˈsɪŋkt/|C2|товч|short, brief, to the point
superfluous|/suːˈpɜːrfluəs/|C2|илүүц, шаардлагагүй|unnecessary, extra, excess
supplant|/səˈplænt/|C2|орлох, түлхэн унагах|replace, take over, overthrow
surmise|/sərˈmaɪz/|C2|таамаглах|guess, suppose, think
surreptitious|/ˌsɜːrəpˈtɪʃəs/|C2|нууцаар хийсэн|secret, hidden, sneaky
susceptible|/səˈseptəbəl/|C1|өртөмтгий|at risk, open to, easily affected
sycophant|/ˈsɪkəfænt/|C2|бялдууч|flatterer, yes-man, follower
taciturn|/ˈtæsɪtɜːrn/|C2|дуу цөөтэй|quiet, silent, reserved
tangible|/ˈtændʒəbəl/|C1|биет, бодит|real, physical, concrete
tantamount|/ˈtæntəmaʊnt/|C2|адилтгах|equal to, the same as, equivalent
tedious|/ˈtiːdiəs/|C1|уйтгартай, залхмаар|boring, dull, tiring
temerity|/təˈmerəti/|C2|ихэмсэг зориг|boldness, nerve, cheek
tenacious|/təˈneɪʃəs/|C2|тууштай, шантаршгүй|determined, persistent, stubborn
tenuous|/ˈtenjuəs/|C2|сул, суурь муутай|weak, thin, uncertain
terse|/tɜːrs/|C2|товч, ширүүн|short, brief, abrupt
torpid|/ˈtɔːrpɪd/|C2|идэвхгүй, сульдсан|sluggish, inactive, slow
tractable|/ˈtræktəbəl/|C2|дуулгавартай|manageable, obedient, easy to control
transient|/ˈtrænziənt/|C2|түр зуурын|temporary, short-lived, passing
trepidation|/ˌtrepɪˈdeɪʃən/|C2|айдас, түгшүүр|fear, worry, anxiety
trite|/traɪt/|C2|улиг болсон|overused, boring, unoriginal
truculent|/ˈtrʌkjələnt/|C2|дайрамхай|aggressive, angry, unfriendly
tumultuous|/tuːˈmʌltʃuəs/|C2|үймээнтэй|noisy, chaotic, wild
ubiquitous|/juːˈbɪkwɪtəs/|C2|хаа сайгүй байдаг|everywhere, common, widespread
unequivocal|/ˌʌnɪˈkwɪvəkəl/|C2|эргэлзээгүй тодорхой|clear, definite, certain
unprecedented|/ʌnˈpresɪdentɪd/|C1|урьд өмнө байгаагүй|new, unusual, never seen before
unscrupulous|/ʌnˈskruːpjələs/|C2|ёс зүйгүй|dishonest, immoral, corrupt
untenable|/ʌnˈtenəbəl/|C2|хамгаалж чадахгүй|weak, impossible to defend, unreasonable
upbraid|/ʌpˈbreɪd/|C2|зэмлэх|scold, criticize, tell off
usurp|/juːˈsɜːrp/|C2|булаан авах|seize, take over, steal
utilitarian|/juːˌtɪlɪˈteriən/|C2|ашиг тустай, практик|practical, useful, functional
utilize|/ˈjuːtəlaɪz/|C1|ашиглах|use, apply, employ
vacillate|/ˈvæsəleɪt/|C2|тээнэгэлзэх|hesitate, waver, be undecided
vapid|/ˈvæpɪd/|C2|хоосон, уйтгартай|dull, boring, empty
vehement|/ˈviːəmənt/|C2|ширүүн, хүчтэй|strong, passionate, intense
venerable|/ˈvenərəbəl/|C2|хүндэт, нэр хүндтэй|respected, honored, old
veracity|/vəˈræsəti/|C2|үнэн зөв байдал|truth, accuracy, honesty
verbose|/vɜːrˈboʊs/|C2|үг ихтэй, нуршуу|wordy, long, talkative
vex|/veks/|C2|бухимдуулах|annoy, irritate, upset
viable|/ˈvaɪəbəl/|C1|хэрэгжих боломжтой|possible, workable, practical
vicarious|/vaɪˈkeriəs/|C2|бусдаар дамжсан|indirect, secondhand, through others
vigilant|/ˈvɪdʒɪlənt/|C2|сонор сэрэмжтэй|watchful, alert, careful
vilify|/ˈvɪlɪfaɪ/|C2|гүтгэх, муулах|criticize, attack, insult
vindicate|/ˈvɪndɪkeɪt/|C2|цагаатгах, зөвийг батлах|clear, justify, prove right
vindictive|/vɪnˈdɪktɪv/|C2|өс хонзонтой|spiteful, unforgiving, mean
virtuoso|/ˌvɜːrtʃuˈoʊsoʊ/|C2|авьяаслаг мастер|expert, master, genius
vitriolic|/ˌvɪtriˈɑːlɪk/|C2|хорон ширүүн|harsh, bitter, cruel
vivacious|/vɪˈveɪʃəs/|C2|сэргэлэн цовоо|lively, cheerful, energetic
vociferous|/voʊˈsɪfərəs/|C2|чанга дуутай, шуугиантай|loud, noisy, outspoken
volatile|/ˈvɑːlətəl/|C2|тогтворгүй|unstable, unpredictable, changeable
voracious|/vəˈreɪʃəs/|C2|ховдог, цангасан|hungry, greedy, eager
vulnerable|/ˈvʌlnərəbəl/|C1|эмзэг, өртөмтгий|weak, unprotected, at risk
wane|/weɪn/|C2|буурах, суларах|decrease, fade, weaken
wary|/ˈweri/|C2|болгоомжлолтой|careful, cautious, suspicious
whimsical|/ˈwɪmzɪkəl/|C2|хачин сонин, дур зоргын|playful, fanciful, unusual
wistful|/ˈwɪstfəl/|C2|гуниглан санагалзсан|sad, longing, thoughtful
zealous|/ˈzeləs/|C2|хэт идэвхтэй, шамдсан|eager, passionate, enthusiastic
zenith|/ˈziːnɪθ/|C2|оргил|peak, top, high point
`;
  const out = {};
  RAW.trim().split('\n').forEach(line => {
    const [w, ipa, lvl, mn, mid] = line.split('|');
    out[w] = { ipa, lvl, mn, mid: mid.split(',').map(s => s.trim()) };
  });
  window.ADVANCED_WORDS = out;
})();
